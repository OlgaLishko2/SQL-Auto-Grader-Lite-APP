export const DB_CONFIG = {
    datasetA: {
        name: './databases/datasetA.sqlite',
        tables: [
            `CREATE TABLE IF NOT EXISTS Departments (
                departmentId INTEGER PRIMARY KEY,
                departmentName TEXT(50) NOT NULL,
                location TEXT(100),
                budget DECIMAL(15,2)
            )`,
            `CREATE TABLE IF NOT EXISTS Employees (
                employeeId INTEGER PRIMARY KEY,
                firstname TEXT(50) NOT NULL,
                lastname TEXT(50) NOT NULL,
                email TEXT(100) UNIQUE,
                departmentId INTEGER,
                salary DECIMAL(12,2) CHECK (salary > 0),
                FOREIGN KEY (departmentId) REFERENCES Departments(departmentId)
            )`
        ]
    },
    datasetB: {
        name: './databases/datasetB.sqlite',
        tables: [
            `CREATE TABLE IF NOT EXISTS Customers (
            customerId INTEGER PRIMARY KEY, 
            firstname TEXT(50) NOT NULL,
                lastname TEXT(50) NOT NULL,
                email TEXT(100) UNIQUE,
            city TEXT(50),
            country TEXT(50)
            )`,
            `CREATE TABLE IF NOT EXISTS Orders (
            orderId INTEGER PRIMARY KEY, 
            customerId INTEGER NOT NULL,
            orderDate DATA NOT NULL,
            totalAmount DECIMAL(12,2) CHECK (totalAmount>=0),
                FOREIGN KEY (customerId) REFERENCES Customers(customerId)
            )`
        ]
    }
};