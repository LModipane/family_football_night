export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        console.log("Auth Heeader:",authHeader)
        console.log("Hello From Create Result Server Route!!!")
        return new Response("Success", {status: 201})
    } catch (error) {
        console.error("Failled to create Match Result: ", error)
        return new Response("Opps, failed to Post match Result", {status: 500})
    }
}