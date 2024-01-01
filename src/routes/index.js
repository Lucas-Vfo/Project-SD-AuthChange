const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { messages } = require('../utils/messages.js');
const { PrismaClient } = require('@prisma/client');
const jwtSecret = process.env.JWT_SECRET || 'tu_secreto_compartido';

const prismaDB = new PrismaClient();
const router = express.Router();

router.post("/change-password", async (req, res) => {
    try {
        const body = req.body;

        const { newPassword, confirmPassword } = body;

        // Validar que se proporcionen todos los campos necesarios
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ messages: messages.error.needProps });
        }

        const headersList = req.headers;
        const token = headersList.token;

        console.log("Valor del token:", token);

        // Verificar si se proporciona un token
        if (!token) {
            console.log("Token no encontrado");
            
            return res.status(400).json({ messages: messages.error.notAuthorized });
        }

        try {
            const isTokenValid = jwt.verify(token, jwtSecret);

            const { data } = isTokenValid;

            console.log("Token válido");
            
            console.log("Valor de data.userId:", data.userId);
            const userFind = await prismaDB.user.findUnique({
                where: {
                    id: data.userId
                }
            });

            // Validar si se encontró al usuario
            if (!userFind) {
                console.log("Usuario no encontrado");
                return res.status(400).json({ messages: messages.error.userNotFound });
            }

            // Validar que la nueva contraseña coincida con la confirmación
            if (newPassword !== confirmPassword) {
                console.log("La nueva contraseña no coincide con la confirmación");
                return res.status(400).json({ messages: messages.error.passwordNotMatch });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prismaDB.user.update({
                where: {
                    id: userFind.id
                },
                data: {
                    password: hashedPassword
                }
            });

            console.log("Contraseña actualizada correctamente");
            return res.status(200).json({ messages: messages.success.passwordChanged });
        } catch (error) {
            console.log("Error al verificar el token:", error);
            return res.status(400).json({ messages: messages.error.tokenNoValid, error });
        }
    } catch (error) {
        console.log("Error al cambiar la contraseña:", error);
        return res.status(400).json({ messages: messages.error.default, error });
    }
});

module.exports = router;
