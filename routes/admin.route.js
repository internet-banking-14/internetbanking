const express = require("express");
const createError = require("https-error");
const personnelModel = require("../models/personnel.model");
const jwt = require("jsonwebtoken");
const router = express.Router();
const transactionModel = require("../models/transaction.model");
const { HmacRIPEMD160 } = require("crypto-js");
router.get("/personnel", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { username } = jwt.decode(token);
  console.log(username);
  try {
    await personnelModel.checkPermission("admin", username);
    const listPersons = await personnelModel.getAll(); //personnel
    res.status(200).json(listPersons);
  } catch (err) {
    console.log("personnel error", err);
    throw err;
  }
});

router.post("/personnel", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { username } = jwt.decode(token);
  try {
    await personnelModel.checkPermission("admin", username);
    let person = req.body;
    person.fullname = person.fullname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    const result = await personnelModel.add(person);
  } catch (err) {
    throw err;
  }
  res.sendStatus(200);
});

router.put("/personnel/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { username } = jwt.decode(token);
  try {
    await personnelModel.checkPermission("admin", username);
    let newPerson = req.body;
    newPerson.fullname = newPerson.fullname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    const succeeded = await personnelModel.updateById(newPerson, req.params.id);
    if (succeeded) {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
});

router.delete("/personnel/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { username } = jwt.decode(token);
  try {
    await personnelModel.checkPermission("admin", username);
    const succeeded = await personnelModel.delById(req.params.id);
    if (succeeded) {
      res.sendStatus(200);
    }
  } catch (err) {
    throw err;
  }
});

router.get("/transactions", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { username } = jwt.decode(token);

  try {
    await personnelModel.checkPermission("admin", username);
    const bankCode = req.body.partner_bank;
    if (!bankCode) {
      throw new createError(400, "Cant find partner bank");
    }
    const transactions = await transactionModel.getAllByBankCode(bankCode);
    res.status(200).json(transactions);
  } catch (err) {
    throw err;
  }
});

module.exports = router;