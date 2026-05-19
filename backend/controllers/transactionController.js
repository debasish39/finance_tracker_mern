import Transaction
from "../models/Transaction.js";

/* GET */

export const getTransactions =
async (req, res) => {

  try {

    const transactions =
    await Transaction.find({

      userId:
      req.query.userId

    }).sort({

      date:-1

    });

    res.status(200).json(
      transactions
    );

  } catch (error) {

    res.status(500).json({
      error:error.message
    });

  }

};

/* ADD */

export const addTransaction =
async (req, res) => {

  try {

    const transaction =
    await Transaction.create(
      req.body
    );

    res.status(201).json(
      transaction
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:error.message
    });

  }

};

/* DELETE */

export const deleteTransaction =
async (req, res) => {

  try {

    await Transaction.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({

      message:
      "Transaction deleted"

    });

  } catch (error) {

    res.status(500).json({
      error:error.message
    });

  }

};