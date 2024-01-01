const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { NextResponse } = require('next/server');
const { headers } = require('next/headers');
const jwtSecret = process.env.JWT_SECRET || 'tu_secreto_compartido';

const prisma = new PrismaClient();

async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('token');

    // Valido que haya token
    if (!token) {
      return NextResponse.json(
        { message: messages.error.notAuthorized },
        { status: 400 }
      );
    }

    try {
      const isTokenValid = jwt.verify(token, jwtSecret);
      const { data } = isTokenValid;

      const userFind = await prisma.user.findUnique({
        where: {
          id: data._id
        }
      });

      // Verificamos que exista el usuario
      if (!userFind) {
        return NextResponse.json(
          {  message: messages.error.userNotFound },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { isAuthorized: true, message: messages.success.authorized },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: messages.error.tokenNoValid, error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: messages.error.default, error },
      { status: 400 }
    );
  }
}

module.exports = { GET };