CREATE TABLE users (
    telegram_id INTEGER PRIMARY KEY, -- Telegram ID как PRIMARY KEY
    username TEXT,
    name TEXT,
    balance INTEGER DEFAULT 10,
    inventory JSONB DEFAULT '[null,null,null,null,null,null,null,null,null,null,null,null]',
    car_ref INTEGER DEFAULT 0,
    car_top INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
