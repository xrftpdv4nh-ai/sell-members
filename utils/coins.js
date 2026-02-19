const fs = require("fs");

const path = "./database/coins.json";

function read() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");
  return JSON.parse(fs.readFileSync(path));
}

function write(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = {
  get(userId) {
    const data = read();
    return data[userId] || 0;
  },

  add(userId, amount) {
    const data = read();
    data[userId] = (data[userId] || 0) + amount;
    write(data);
  }
};
