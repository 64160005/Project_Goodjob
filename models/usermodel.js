const db = require("../config/database");
const bcrypt = require("bcrypt");

class UserModel {
  static async findByEmail(email) {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      console.log(`Successfully found user with email: ${email}`);
      return rows[0];
    } catch (error) {
      console.error(`Error finding user with email ${email}:`, error);
      throw error;
    }
  }

  static async registerUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.user_pass, 12);
    const query = `
      INSERT INTO users 
      (email, password, name, introduce, gender, birthday, address, identification, user_phonenumber, picture_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      userData.user_email,
      hashedPassword,
      userData.user_name,
      userData.introduce,
      userData.gender,
      userData.birthday,
      userData.address,
      userData.identification,
      userData.user_phonenumber,
      userData.picture_url,
    ];

    try {
      const [result] = await db.query(query, values);
      console.log("Insert result:", result);
      return result.insertId;
    } catch (error) {
      console.error("Database insertion error:", error);
      throw error;
    }
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

module.exports = UserModel;
