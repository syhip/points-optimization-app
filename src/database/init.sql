-- SQLite数据库初始化脚本
-- 积分优化助手应用

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 支付方式表
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户支付方式关联表
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id TEXT REFERENCES payment_methods(id) ON DELETE CASCADE,
    account_info TEXT, -- JSON格式存储
    is_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商家表
CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    category TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    chain_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 积分规则表
CREATE TABLE IF NOT EXISTS point_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
    payment_method_id TEXT REFERENCES payment_methods(id) ON DELETE CASCADE,
    point_rate REAL NOT NULL,
    min_amount REAL DEFAULT 0,
    promotion_type TEXT,
    valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_to DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 积分历史表
CREATE TABLE IF NOT EXISTS point_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    merchant_id TEXT REFERENCES merchants(id),
    payment_method_id TEXT REFERENCES payment_methods(id),
    amount REAL NOT NULL,
    points_earned REAL NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_point_rules_merchant_payment ON point_rules(merchant_id, payment_method_id);
CREATE INDEX IF NOT EXISTS idx_point_history_user_date ON point_history(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_merchants_location ON merchants(latitude, longitude);

-- 初始化支付方式数据
INSERT OR IGNORE INTO payment_methods (id, name, type, icon_url) VALUES
('pay001', 'Pay', 'mobile_payment', 'https://example.com/pay-icon.png'),
('aupay001', 'AuPay', 'mobile_payment', 'https://example.com/aupay-icon.png'),
('rakuten001', '乐天Pay', 'mobile_payment', 'https://example.com/rakuten-pay-icon.png'),
('mpay001', 'MPay', 'mobile_payment', 'https://example.com/mpay-icon.png');

-- 初始化商家数据
INSERT OR IGNORE INTO merchants (id, name, category, latitude, longitude, address, chain_name) VALUES
('merchant001', '7-Eleven 新宿店', 'convenience_store', 35.6895, 139.7006, '东京都新宿区', '7-Eleven'),
('merchant002', '全家便利店 涩谷店', 'convenience_store', 35.6598, 139.7006, '东京都涩谷区', 'FamilyMart'),
('merchant003', '罗森便利店 银座店', 'convenience_store', 35.6762, 139.7653, '东京都中央区银座', 'Lawson'),
('merchant004', '7-Eleven 原宿店', 'convenience_store', 35.6702, 139.7016, '东京都涩谷区原宿', '7-Eleven'),
('merchant005', '全家便利店 表参道店', 'convenience_store', 35.6654, 139.7101, '东京都港区表参道', 'FamilyMart');

-- 初始化积分规则数据
INSERT OR IGNORE INTO point_rules (merchant_id, payment_method_id, point_rate, min_amount, promotion_type) VALUES
-- 7-Eleven 新宿店
('merchant001', 'pay001', 2.0, 100, 'standard'),
('merchant001', 'aupay001', 1.5, 100, 'standard'),
('merchant001', 'rakuten001', 3.0, 200, 'promotion'),
('merchant001', 'mpay001', 1.0, 100, 'standard'),
-- 全家便利店 涩谷店
('merchant002', 'pay001', 1.5, 100, 'standard'),
('merchant002', 'aupay001', 2.5, 100, 'promotion'),
('merchant002', 'rakuten001', 2.0, 150, 'standard'),
('merchant002', 'mpay001', 1.2, 100, 'standard'),
-- 罗森便利店 银座店
('merchant003', 'pay001', 1.8, 100, 'standard'),
('merchant003', 'aupay001', 1.0, 100, 'standard'),
('merchant003', 'rakuten001', 2.5, 200, 'standard'),
('merchant003', 'mpay001', 3.0, 150, 'promotion'),
-- 7-Eleven 原宿店
('merchant004', 'pay001', 2.2, 100, 'promotion'),
('merchant004', 'aupay001', 1.8, 100, 'standard'),
('merchant004', 'rakuten001', 1.5, 100, 'standard'),
('merchant004', 'mpay001', 1.0, 100, 'standard'),
-- 全家便利店 表参道店
('merchant005', 'pay001', 1.0, 100, 'standard'),
('merchant005', 'aupay001', 2.0, 100, 'standard'),
('merchant005', 'rakuten001', 2.8, 200, 'promotion'),
('merchant005', 'mpay001', 1.5, 100, 'standard');

-- 创建测试用户
INSERT OR IGNORE INTO users (id, email, phone, name, password_hash, plan) VALUES
('user001', 'test@example.com', '1234567890', '测试用户', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'free'),
('user002', 'demo@example.com', '0987654321', '演示用户', '$2b$10$dEmoUserHashHashHashHash', 'premium');

-- 为测试用户添加支付方式
INSERT OR IGNORE INTO user_payment_methods (user_id, payment_method_id, account_info, is_enabled) VALUES
('user001', 'pay001', '{"account": "test_pay_account"}', 1),
('user001', 'aupay001', '{"account": "test_aupay_account"}', 1),
('user001', 'rakuten001', '{"account": "test_rakuten_account"}', 1),
('user002', 'pay001', '{"account": "demo_pay_account"}', 1),
('user002', 'mpay001', '{"account": "demo_mpay_account"}', 1);

-- 添加一些测试积分历史
INSERT OR IGNORE INTO point_history (user_id, merchant_id, payment_method_id, amount, points_earned, transaction_date) VALUES
('user001', 'merchant001', 'pay001', 500, 10.0, '2024-01-15 10:30:00'),
('user001', 'merchant002', 'aupay001', 300, 7.5, '2024-01-14 15:20:00'),
('user001', 'merchant003', 'rakuten001', 800, 20.0, '2024-01-13 12:45:00'),
('user002', 'merchant001', 'pay001', 1200, 24.0, '2024-01-12 09:15:00'),
('user002', 'merchant004', 'mpay001', 600, 6.0, '2024-01-11 18:30:00');