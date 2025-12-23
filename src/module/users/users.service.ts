import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,

    ) { }

    async completeProfile(
        userId: number,
        dto: UserDto,
    ) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const updatedUser = await this.prisma.users.update({
            where: { id: userId },
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                age: dto.age,
                gender: dto.gender,
                course: dto.course,
                phone: dto.phone,
                location: dto.location,
                updated_at: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                age: true,
                gender: true,
                course: true,
                phone: true,
                location: true,
            },
        });

        return {
            message: 'Perfil completado correctamente',
            user: updatedUser,
        };
    }

    async getById(userId: number) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                age: true,
                gender: true,
                course: true,
                phone: true,
                location: true,
                created_at: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const formattedDate = user.created_at?.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
        });

        return {
            ...user,
            created_at: formattedDate,
        };
    }

    async updateUser(userId: number, dto: UserDto) {
    const user = await this.prisma.users.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new UnauthorizedException('Usuario no válido');
    }

    const updatedUser = await this.prisma.users.update({
        where: { id: userId },
        data: {
            first_name: dto.first_name,
            last_name: dto.last_name,
            age: dto.age,
            gender: dto.gender,
            course: dto.course,
            email: dto.email,
            location: dto.location,
            updated_at: new Date(),
        },
        select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
            age: true,
            gender: true,
            course: true,
            phone: true,
            location: true,
        },
    });

    return {
        message: 'Usuario actualizado correctamente',
        user: updatedUser,
    };
}


}
