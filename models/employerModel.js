const db = require("../config/database");
const bcrypt = require("bcrypt");

class EmployerModel {
  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM employers WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async registerEmployer(employerData) {
    const hashedPassword = await bcrypt.hash(employerData.user_pass, 12);
    const [result] = await db.query(
      "INSERT INTO employers (email, password, shop_name, shop_address, shop_phonenumber, shop_type) VALUES (?, ?, ?, ?, ?, ?)",
      [
        employerData.user_email,
        hashedPassword,
        employerData.shop_name,
        employerData.shop_address,
        employerData.shop_phonenumber,
        employerData.shop_type,
      ]
    );
    return result.insertId;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      console.log(`Password verification result: ${isMatch}`);
      return isMatch;
    } catch (error) {
      console.error("Error verifying password:", error);
      throw error;
    }
  }
}

module.exports = EmployerModel;
