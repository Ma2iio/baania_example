export interface IRequestCreateHouse {
    name: string
    desc: string
    price: number
    post_code: string
}

export interface IRequestUpdateHouse {
    name: string
    desc: string
    price: number
    postCode: string
}

export interface IRequestHomeParams {
    skip: string
    take: string
}
