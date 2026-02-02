export async function POST() {
    try {
        console.log("Hello From Create Result Server Route!!!")
    } catch (error) {
        console.error("Failled to create Match Result: ", error)
        return new Response("Opps, failed to Post match Result")
    }
}