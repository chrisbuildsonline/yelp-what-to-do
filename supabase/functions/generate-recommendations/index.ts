import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive prompt
    let prompt = `You are a local discovery expert creating personalized experiences. Generate 6 diverse recommendations for a group.

User: ${preferences.name}
- Interests: ${preferences.interests.join(", ")}
- Food Preferences: ${preferences.foodPreferences.join(", ")}
- Dietary Restrictions: ${preferences.dietaryRestrictions.join(", ")}`;

    if (preferences.companions && preferences.companions.length > 0) {
      prompt += `\n\nCompanions:`;
      preferences.companions.forEach((comp: any, idx: number) => {
        prompt += `\n${idx + 1}. ${comp.name || `Person ${idx + 2}`}
   - Interests: ${comp.interests.join(", ")}
   - Food Preferences: ${comp.foodPreferences.join(", ")}
   - Dietary Restrictions: ${comp.dietaryRestrictions.join(", ")}`;
      });
    }

    prompt += `\n\nCreate 6 diverse, personalized recommendations (mix of restaurants, cafes, and activities) that cater to the group's combined interests and dietary needs. Return ONLY valid JSON array with this exact structure:
[
  {
    "name": "Business Name",
    "category": "Restaurant|Cafe|Activity",
    "cuisine": "cuisine type or activity type",
    "rating": 4.5,
    "reviewCount": 200,
    "priceRange": "$|$$|$$$",
    "image": "https://images.unsplash.com/photo-[relevant-unsplash-photo-id]",
    "location": {
      "address": "street address",
      "city": "San Francisco, CA",
      "distance": "X.X miles"
    },
    "description": "compelling 2-sentence description highlighting why it matches their preferences",
    "hours": "operating hours",
    "phone": "(415) 555-XXXX",
    "features": ["feature1", "feature2", "feature3"],
    "reviews": [
      {
        "id": "r1",
        "author": "Reviewer Name",
        "rating": 5,
        "date": "X days ago",
        "text": "review text",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ReviewerName"
      }
    ],
    "whyRecommended": "1-sentence explanation of why this matches the group"
  }
]

Important: 
- Use real Unsplash photo IDs that match the business type
- Make descriptions personal and reference specific group preferences
- Ensure dietary restrictions are respected
- Mix venue types (fine dining, casual, cafes, activities)
- Return ONLY the JSON array, no other text`;

    console.log("Sending request to AI gateway with prompt:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a local discovery expert. Always respond with valid JSON only, no markdown or explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data, null, 2));
    
    let recommendations;
    try {
      const content = data.choices[0].message.content;
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", data.choices[0].message.content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Ensure we have valid recommendations
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error("AI did not return valid recommendations");
    }

    // Generate unique IDs for recommendations
    recommendations = recommendations.map((rec: any, idx: number) => ({
      ...rec,
      id: `rec-${idx + 1}`
    }));

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-recommendations function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
