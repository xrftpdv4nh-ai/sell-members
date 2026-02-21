module.exports = {
  name: "panel",
  async run(client, message) {
    const panel = require("../panels/verifyPanel");
    return panel.run(client, message);
  }
};
