const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        fabric: {
            type: String,
        },
        occasion: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        discountPrice: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        images: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
            },
        ],
        sizes: [
            {
                label: { type: String },
                stock: { type: Number, default: 0 },
            },
        ],
        colors: [String],
        colorVariants: [
            {
                colorName: { type: String, required: true },
                colorHex: { type: String, default: '#cccccc' },
                images: [
                    {
                        url: { type: String, required: true },
                        publicId: { type: String, required: true },
                    },
                ],
                stock: { type: Number, default: 0 },
                price: { type: Number, default: 0 },
                discountPrice: { type: Number, default: 0 },
                sizes: [
                    {
                        label: { type: String },
                        stock: { type: Number, default: 0 },
                    },
                ],
            },
        ],
        tags: [String],
        isFeatured: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
        reviews: [
            {
                name: { type: String, required: true },
                rating: { type: Number, required: true },
                comment: { type: String, required: false },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'User',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

productSchema.pre('save', async function () {
    if (!this.isModified('name')) {
        return;
    }

    let baseSlug = this.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');

    let slug = baseSlug;
    let count = 0;

    // Ensure slug is unique
    while (true) {
        const existingProduct = await mongoose.model('Product').findOne({ 
            slug, 
            _id: { $ne: this._id } 
        });
        
        if (!existingProduct) break;
        
        count++;
        slug = `${baseSlug}-${count}`;
    }

    this.slug = slug;
});

module.exports = mongoose.model('Product', productSchema);
