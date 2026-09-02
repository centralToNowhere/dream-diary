import query from '@/infrastructure/db/query';
import type { DreamDto, DreamRow, CreateDreamInput, UpdateDreamInput } from './types';

const toDreamDto = (dream: DreamRow): DreamDto => {
    const dreamDate = dream.dream_date instanceof Date
        ? dream.dream_date.toISOString().slice(0, 10)
        : dream.dream_date;

    return {
        id: dream.id,
        userId: dream.user_id,
        title: dream.title,
        description: dream.description,
        rating: dream.rating,
        dreamDate,
        imageUrl: dream.image_url,
        createdAt: dream.created_at.toISOString(),
    };
}

const getDreams = async (userId: number): Promise<DreamDto[]> => {
    const data = await query(sql => sql<DreamRow[]>`
        SELECT d.id, d.user_id, d.title, d.description, d.rating, d.dream_date, d.image_url, d.created_at
        FROM dreams d
        WHERE d.user_id = ${userId}
        ORDER BY dream_date DESC, created_at DESC
    `);

    return data.map(toDreamDto);
}

const getDreamById = async (id: number, userId: number): Promise<DreamDto | null> => {
    const data = await query(sql => sql<DreamRow[]>`
        SELECT id, user_id, title, description, rating, dream_date, image_url, created_at
        FROM dreams
        WHERE dreams.id = ${id} AND user_id = ${userId} 
    `);

    return data[0] ? toDreamDto(data[0]) : null;
}

const createDream = async ({
    userId, title, description, rating, dreamDate
}: CreateDreamInput): Promise<DreamDto | null> => {
    const data = await query(sql => sql<DreamRow[]>`
        INSERT INTO dreams (user_id, title, description, rating, dream_date, image_url, created_at)
        VALUES (${userId}, ${title}, ${description}, ${rating}, ${dreamDate}, NULL, NOW())
        RETURNING id, user_id, title, description, rating, dream_date, image_url, created_at
    `);

    return data[0] ? toDreamDto(data[0]) : null;
}

const updateDream = async (
    id: number,
    userId: number,
    { title, description, rating, dreamDate }: UpdateDreamInput,
): Promise<DreamDto | null> => {
    const data = await query(sql => sql<DreamRow[]>`
        UPDATE dreams
        SET title = ${title},
            description = ${description},
            rating = ${rating},
            dream_date = ${dreamDate}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, user_id, title, description, rating, dream_date, image_url, created_at
    `);

    return data[0] ? toDreamDto(data[0]) : null;
}

export {
    getDreams,
    getDreamById,
    createDream,
    updateDream,
}
