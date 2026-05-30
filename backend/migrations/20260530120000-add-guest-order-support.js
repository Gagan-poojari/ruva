/**
 * Guest checkout support for the `orders` collection.
 *
 * Stack: MongoDB (Mongoose models are separate; this is a DB-level migration).
 * Tool: migrate-mongo — https://github.com/seppevs/migrate-mongo
 *
 * Notes:
 * - MongoDB is schemaless; new fields (guest_email, guest_phone, guest_order_token)
 *   are added when documents are written. This migration adds indexes + a validator.
 * - The registered-user field is `user` (ObjectId), not `user_id`. No existing field
 *   is renamed or altered; the validator allows `user` to be absent when guest_email
 *   is set (guest orders).
 */

const MIGRATION_ID = '20260530120000-add-guest-order-support';
const META_COLLECTION = 'migration_state';

const GUEST_EMAIL_INDEX = 'orders_guest_email_idx';
const GUEST_ORDER_TOKEN_INDEX = 'orders_guest_order_token_unique_idx';

const guestOrderValidator = {
    $jsonSchema: {
        bsonType: 'object',
        anyOf: [
            {
                required: ['user'],
                properties: {
                    user: { bsonType: 'objectId' },
                },
            },
            {
                required: ['guest_email'],
                properties: {
                    guest_email: { bsonType: 'string', minLength: 1 },
                },
            },
        ],
    },
};

function mergeValidators(existingValidator, addition) {
    if (!existingValidator || Object.keys(existingValidator).length === 0) {
        return addition;
    }
    return { $and: [existingValidator, addition] };
}

async function getOrdersCollectionOptions(db) {
    const [info] = await db.listCollections({ name: 'orders' }).toArray();
    return info?.options ?? {};
}

module.exports = {
    async up(db) {
        const orders = db.collection('orders');
        const priorOptions = await getOrdersCollectionOptions(db);

        await db.collection(META_COLLECTION).updateOne(
            { _id: MIGRATION_ID },
            {
                $set: {
                    previousValidator: priorOptions.validator ?? null,
                    previousValidationLevel: priorOptions.validationLevel ?? 'strict',
                    previousValidationAction: priorOptions.validationAction ?? 'error',
                },
            },
            { upsert: true }
        );

        await orders.createIndex({ guest_email: 1 }, { name: GUEST_EMAIL_INDEX });
        await orders.createIndex(
            { guest_order_token: 1 },
            { unique: true, sparse: true, name: GUEST_ORDER_TOKEN_INDEX }
        );

        await db.command({
            collMod: 'orders',
            validator: mergeValidators(priorOptions.validator, guestOrderValidator),
            validationLevel: priorOptions.validationLevel ?? 'moderate',
            validationAction: priorOptions.validationAction ?? 'error',
        });
    },

    async down(db) {
        const orders = db.collection('orders');
        const meta = await db.collection(META_COLLECTION).findOne({ _id: MIGRATION_ID });

        try {
            await orders.dropIndex(GUEST_EMAIL_INDEX);
        } catch (err) {
            if (err.codeName !== 'IndexNotFound') {
                throw err;
            }
        }

        try {
            await orders.dropIndex(GUEST_ORDER_TOKEN_INDEX);
        } catch (err) {
            if (err.codeName !== 'IndexNotFound') {
                throw err;
            }
        }

        const collMod = {
            collMod: 'orders',
            validationLevel: meta?.previousValidationLevel ?? 'strict',
            validationAction: meta?.previousValidationAction ?? 'error',
        };

        if (meta?.previousValidator) {
            collMod.validator = meta.previousValidator;
        } else {
            collMod.validator = {};
        }

        await db.command(collMod);
        await db.collection(META_COLLECTION).deleteOne({ _id: MIGRATION_ID });
    },
};
