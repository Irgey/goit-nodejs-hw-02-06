const express = require("express");

const {
  getAll,
  getById,
  add,
  deleteById,
  updateById,
  updateFavoriteById,
} = require("../../controllers/contacts-controller");

const { validateBody } = require("../../decorators");
const { isBodyEmpty, isValidId } = require("../../middlewares");
const {
  contactAddSchema,
  contactUpdateFavoriteSchema,
} = require("../../schemas/contactSchema");
const router = express.Router();

router.get("/", getAll);

router.get("/:contactId", isValidId, getById);

router.post("/", isBodyEmpty, validateBody(contactAddSchema), add);

router.delete("/:contactId", isValidId, deleteById);

router.put(
  "/:contactId",
  isValidId,
  isBodyEmpty,
  validateBody(contactAddSchema),
  updateById
);
router.patch(
  "/:contactId/favorite",
  isValidId,
  isBodyEmpty,
  validateBody(contactUpdateFavoriteSchema),
  updateFavoriteById
);

module.exports = router;
