-- Users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keycloak_username VARCHAR(100) UNIQUE,
    email_encrypt VARCHAR(100),
    phonenum_encrypt VARCHAR(100),
    joindate_time DATETIME
);

-- ServiceTypes
CREATE TABLE ServiceTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20),
    description VARCHAR(100)
);

-- PaymentMethods
CREATE TABLE PaymentMethods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);

-- Service
CREATE TABLE Service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_id INT,
    user_encrypt VARCHAR(100),
    pass_encrypt VARCHAR(100),
    join_datetime DATETIME,
    misc1 VARCHAR(100),
    misc2 VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES ServiceTypes(id) ON DELETE CASCADE
);

-- Payment
CREATE TABLE Payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    payment_method_id INT,
    service_type_id INT,
    amount INT,
    paydate_time DATETIME,
    service_period_sec INT,
    package VARCHAR(100),
    voucher VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_method_id) REFERENCES PaymentMethods(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_type_id) REFERENCES ServiceTypes(id) ON DELETE RESTRICT
);

-- DefaultPaymentLimits
CREATE TABLE DefaultPaymentLimits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    payment_method_id INT,
    payment_limit INT,
    payment_limit_period_sec INT,
    FOREIGN KEY (service_id) REFERENCES ServiceTypes(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES PaymentMethods(id) ON DELETE CASCADE
);

-- Package
CREATE TABLE Package (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) UNIQUE,
    service_id INT,
    description VARCHAR(200),
    amount INT UNIQUE,
    time_period INT,
    created_date DATETIME,
    updated_date DATETIME,
    FOREIGN KEY (service_id) REFERENCES ServiceTypes(id) ON DELETE CASCADE
);

-- UserPaymentLimits
CREATE TABLE UserPaymentLimits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_type_id INT,
    payment_method_id INT,
    payment_limit INT,
    payment_limit_period_sec INT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_type_id) REFERENCES ServiceTypes(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES PaymentMethods(id) ON DELETE CASCADE
);
