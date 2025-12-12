import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Helper to convert SVG File to PNG base64 (since Gemini Vision doesn't support SVG)
const svgFileToPngBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Use intrinsic size or default to a reasonable diagram size
      canvas.width = img.width || 800; 
      canvas.height = img.height || 600;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // SVG usually has transparent background; fill white for better AI visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Get base64 data (remove prefix)
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      } else {
        reject(new Error('Canvas context missing'));
      }
      URL.revokeObjectURL(url);
    };
    
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to convert SVG to PNG for analysis"));
    };
    
    img.src = url;
  });
};

export const analyzeTransactionLogs = async (
  apiKey: string,
  logs: string, 
  transferId: string, 
  imageFile: File | null
): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  // Initialize the client with the user-provided key
  const ai = new GoogleGenAI({ apiKey });
  
  // Use 2.5 Flash for multimodal (Image + Text) capabilities
  const model = "gemini-2.5-flash";

  const parts: any[] = [];
  
  // Add the image if provided
  if (imageFile) {
    let imagePart;
    // Gemini doesn't support image/svg+xml, so we convert to PNG
    if (imageFile.type === 'image/svg+xml') {
      try {
        const pngBase64 = await svgFileToPngBase64(imageFile);
        imagePart = {
          inlineData: { data: pngBase64, mimeType: 'image/png' }
        };
      } catch (e) {
        console.error("SVG Conversion failed:", e);
        throw new Error("Could not process SVG file. Please upload a PNG or JPG.");
      }
    } else {
      imagePart = await fileToGenerativePart(imageFile);
    }
    parts.push(imagePart);
  }

  // Construct the prompt
  const textPrompt = `
  You are a **Senior Payment Systems Architect** operating the Network Operations Center (NOC) for a Global Fintech.

  **OBJECTIVE:**
  Conduct a **Forensic Root Cause Analysis (RCA)** on the failed or stalled transaction "${transferId}".

  **INPUTS:**
  1. **Flow Diagram (Visual):** The "Happy Path" architecture.
  2. **Server Logs (Text):** The messy reality. Contains trace_ids, ISO20022 references, and potential latency gaps.

  **ANALYSIS RULES (THE "SMELL TEST"):**
  1. **Validate Specifics:** Don't just say "Validation Failed." Look for *specific* field errors (e.g., MT103 Field 59, IBAN Modulo Check, BIC directory).
  2. **Liquidity & Settlement:** If the logs mention "Liquidity" or "Limits," investigate **Nostro/Vostro** account funding issues.
  3. **Latency is a Bug:** If the transaction "Succeeded" but took 45 seconds when the SLA is 2 seconds, that is a **FAILURE**. Point out the specific service (e.g., Compliance Queue) causing the bottleneck.
  4. **Business Impact:** Translate technical errors into business loss (e.g., "SLA Breach," "Liquidity Lock," "Customer Churn Risk").

  **OUTPUT JSON REQUIREMENTS:**
  1. **executiveSummary:** High-level summary for the CTO.
  2. **severity:** CRITICAL (Money lost/Stuck), MAJOR (Service degradation), or MINOR (UI error).
  3. **businessImpact:** Describe the impact on the business (e.g. "Regulatory Fine Risk", "User Churn").
  4. **suggestedAction:** The operational next step (e.g., "Trigger Manual Refund", "Escalate to Treasury").
  5. **aiConfidence:** How sure are you? (0-100).

  Logs:
  ${logs}
  `;

  parts.push({ text: textPrompt });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactionId: { type: Type.STRING },
          currencyPair: { type: Type.STRING },
          amount: { type: Type.STRING },
          
          executiveSummary: { type: Type.STRING, description: "Professional summary of the financial impact." },
          failureTrace: { type: Type.STRING, description: "Technical root cause (e.g., specific SWIFT field or Service)." },
          technicalRecommendation: { type: Type.STRING, description: "Engineering fix." },
          
          severity: { type: Type.STRING, enum: ["CRITICAL", "MAJOR", "MINOR"] },
          businessImpact: { type: Type.STRING, description: "e.g., 'SLA Breach (45s)' or 'Regulatory Risk'" },
          suggestedAction: { type: Type.STRING, description: "Operational fix, e.g. 'Manual Refund'" },
          aiConfidence: { type: Type.NUMBER, description: "Confidence score 0-100" },

          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepName: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["pending", "success", "failed", "warning"] },
                timestamp: { type: Type.STRING },
                logSnippet: { type: Type.STRING },
                description: { type: Type.STRING },
                entity: { type: Type.STRING }
              }
            }
          },
          riskScore: { type: Type.NUMBER },
          complianceFlags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["transactionId", "executiveSummary", "failureTrace", "technicalRecommendation", "steps", "severity", "suggestedAction", "aiConfidence"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as AnalysisResult;
};

export const MOCK_LOGS = `...`; // (Unused now, relying on scenarios)