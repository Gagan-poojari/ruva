const NOMINATIM_HEADERS = {
    Accept: 'application/json',
    'User-Agent': 'RUVA-Store/1.0 (checkout pincode lookup)',
};

/** @param {string} pincode */
async function fetchFromPostalPincode(pincode) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.Status !== 'Success' || !Array.isArray(data.PostOffice) || !data.PostOffice.length) {
            return null;
        }
        const po = data.PostOffice[0];
        const area = [po.Name, po.Block].filter(Boolean).join(', ');
        return {
            pincode,
            city: po.District || po.Name || '',
            state: po.State || '',
            area,
        };
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

/** @param {string} pincode */
async function fetchFromNominatim(pincode) {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('postalcode', pincode);
    url.searchParams.set('countrycodes', 'in');
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(url.toString(), {
            headers: NOMINATIM_HEADERS,
            signal: controller.signal,
        });
        if (!res.ok) return null;
        const results = await res.json();
        const hit = results?.[0];
        const addr = hit?.address;
        if (!addr) return null;

        const area = [addr.suburb, addr.neighbourhood, addr.village, addr.town]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(', ');

        return {
            pincode,
            city: addr.city || addr.city_district || addr.county || addr.state_district || '',
            state: addr.state || '',
            area: area || addr.suburb || hit.display_name?.split(',')[0] || '',
        };
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

/** @param {string} pincode */
async function resolvePincode(pincode) {
    const fromIndiaPost = await fetchFromPostalPincode(pincode);
    if (fromIndiaPost?.city && fromIndiaPost?.state) return fromIndiaPost;
    return fetchFromNominatim(pincode);
}

// @route   GET /api/location/pincode/:pincode
const lookupPincode = async (req, res) => {
    const pincode = String(req.params.pincode || '').replace(/\D/g, '');
    if (pincode.length !== 6) {
        return res.status(400).json({ message: 'Enter a valid 6-digit pincode' });
    }

    try {
        const result = await resolvePincode(pincode);
        if (!result?.city || !result?.state) {
            return res.status(404).json({ message: 'No address found for this pincode' });
        }
        return res.json(result);
    } catch (err) {
        console.error('Pincode lookup error:', err.message);
        return res.status(502).json({ message: 'Pincode lookup service unavailable' });
    }
};

module.exports = { lookupPincode };
