const Commission = require("../models/commission.model");
const User = require("../models/user.model");

// Update User totals whenever a commission is created/updated
commissionSchema.post("save", async function (doc, next) {
  try {
    const commissions = await Commission.find({ user: doc.user });

    const totalEarned = commissions.reduce((sum, c) =>
      sum + (["approved", "paid"].includes(c.status) ? c.amount : 0), 0
    );

    const pending = commissions.reduce((sum, c) =>
      sum + (c.status === "pending" ? c.amount : 0), 0
    );

    const paidOut = commissions.reduce((sum, c) =>
      sum + (c.status === "paid" ? c.amount : 0), 0
    );

    await User.findByIdAndUpdate(doc.user, {
      $set: {
        "commissions.totalEarned": totalEarned,
        "commissions.pending": pending,
        "commissions.paidOut": paidOut,
      }
    });

    next();
  } catch (err) {
    next(err);
  }
});
