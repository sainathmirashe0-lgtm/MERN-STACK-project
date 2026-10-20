import express from 'express';

import registrations from "../controller/auth.js";

const authUser = express.Router();

authUser.post("/register",registrations.registration);
authUser.post("/",registrations.login)
export default authUser;
