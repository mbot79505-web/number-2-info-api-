const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8080; // Fixed port 8080

// ---------- STORAGE ----------
const users = {};

// ---------- HELPER: Generate Key ----------
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

// ---------- ROOT (Hidden) ----------
app.get('/', (req, res) => {
    res.json({
        status: "Numbar info api is running ✅",
        endpoints: {
            "/api/info?number=YOUR_NUMBER&key=YOUR_KEY": "Get number info"
        },
        credit: "@nur_0_0_19"
    });
});

// ---------- CREATE KEY (Hidden) ----------
app.get('/MAHA88/new', (req, res) => {
    const customKey = req.query.key;
    const days = parseInt(req.query.day) || 7;

    if (days < 1 || days > 365) {
        return res.status(400).json({
            success: false,
            error: 'Day must be between 1 and 365'
        });
    }

    const finalKey = customKey || generateKey();

    if (users[finalKey]) {
        return res.status(400).json({
            success: false,
            error: 'Key already exists!'
        });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    users[finalKey] = {
        key: finalKey,
        created_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        days: days,
        active: true
    };

    res.json({
        success: true,
        message: 'Key created successfully!',
        data: users[finalKey]
    });
});

// ---------- DELETE KEY (Hidden) ----------
app.get('/MAHA88/delete', (req, res) => {
    const key = req.query.key;

    if (!key) {
        return res.status(400).json({
            success: false,
            error: 'Key parameter is required'
        });
    }

    if (!users[key]) {
        return res.status(404).json({
            success: false,
            error: 'Key not found'
        });
    }

    delete users[key];

    res.json({
        success: true,
        message: `Key "${key}" deleted successfully`
    });
});

// ---------- CHECK KEY (Hidden) ----------
app.get('/MAHA88/check', (req, res) => {
    const key = req.query.key;

    if (!key) {
        return res.status(400).json({
            success: false,
            error: 'Key parameter is required'
        });
    }

    const user = users[key];

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'Invalid key'
        });
    }

    const now = new Date();
    const expiry = new Date(user.expires_at);

    if (now > expiry) {
        user.active = false;
        return res.status(403).json({
            success: false,
            error: 'Key expired'
        });
    }

    res.json({
        success: true,
        valid: true,
        data: {
            key: user.key,
            expires_at: user.expires_at,
            days_remaining: Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        }
    });
});

// ---------- MAIN API ----------
app.get('/api/info', async (req, res) => {
    const number = req.query.number;
    const key = req.query.key;

    if (!key) {
        return res.status(401).json({
            error: 'API key required!'
        });
    }

    const user = users[key];
    if (!user) {
        return res.status(403).json({
            error: 'Invalid API key'
        });
    }

    const now = new Date();
    const expiry = new Date(user.expires_at);
    if (now > expiry) {
        user.active = false;
        return res.status(403).json({
            error: 'API key expired'
        });
    }

    if (!number) {
        return res.status(400).json({
            error: 'Number parameter is required'
        });
    }

    try {
        const response = await axios.get(`https://ownerjii-api-ayno.vercel.app/api/info?number=${number}`, {
            timeout: 10000
        });

        let records = [];
        if (response.data?.result?.result?.result) {
            records = response.data.result.result.result;
        } else if (response.data?.result?.result) {
            records = response.data.result.result;
        } else if (response.data?.result) {
            records = response.data.result;
        } else {
            records = [];
        }

        if (!Array.isArray(records)) {
            records = [records];
        }

        const cleanData = {
            total: records.length,
            result: records
        };

        res.json(cleanData);

    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch data',
            details: error.message
        });
    }
});

// ---------- START ----------
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📋 Active keys: ${Object.keys(users).length}`);
});
