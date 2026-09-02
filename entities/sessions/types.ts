export type SessionDTO = {
    id: number
    jwt: string
    jwtExpires: Date
    refreshToken: string
    refreshTokenExpires: Date
}

export type SessionRefreshResponse = {
    userId: number
    jwt: string
    jwtExpires: Date
}
