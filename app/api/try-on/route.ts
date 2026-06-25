import { generateText } from "ai"

export const maxDuration = 60

interface TryOnRequest {
  userImage: string // data URL of the person photo
  garmentImage: string // path or url of the clothing
  garmentName: string
}

export async function POST(req: Request) {
  let body: TryOnRequest
  try {
    body = (await req.json()) as TryOnRequest
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { userImage, garmentImage, garmentName } = body

  if (!userImage || !garmentImage) {
    return Response.json({ error: "Both a photo and a garment are required." }, { status: 400 })
  }

  // Resolve garment image to an absolute URL for the model
  let garmentUrl = garmentImage
  if (garmentImage.startsWith("/")) {
    const origin = new URL(req.url).origin
    garmentUrl = `${origin}${garmentImage}`
  }

  try {
    const result = await generateText({
      model: "google/gemini-3.1-flash-image-preview",
      providerOptions: {
        google: { responseModalities: ["IMAGE", "TEXT"] },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Create a realistic virtual try-on image. Take the person in the first image and dress them in the ` +
                `garment shown in the second image (${garmentName}). Keep the person's face, body, pose, and background ` +
                `consistent. Make the clothing fit naturally with realistic folds, lighting, and shadows. ` +
                `Output a single photorealistic image.`,
            },
            { type: "image", image: userImage },
            { type: "image", image: new URL(garmentUrl) },
          ],
        },
      ],
    })

    const file = result.files?.find((f) => f.mediaType?.startsWith("image/"))

    if (!file) {
      return Response.json(
        { error: "The model did not return an image. Please try again with a clearer full-body photo." },
        { status: 502 },
      )
    }

    const dataUrl = `data:${file.mediaType};base64,${file.base64}`
    return Response.json({ image: dataUrl })
  } catch (err) {
    console.log("[v0] try-on generation error:", err instanceof Error ? err.message : err)
    return Response.json(
      {
        error:
          "AI try-on is not available. Connect the Vercel AI Gateway (or set AI_GATEWAY_API_KEY) to enable real generation.",
      },
      { status: 503 },
    )
  }
}
