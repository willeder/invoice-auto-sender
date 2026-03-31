import { NextResponse } from "next/server";
import { getInvoice } from "@/lib/mockDb";

function buildTinyPdf(text: string) {
  // 超簡易PDF（モック）。日本語はフォント未埋め込みのため化ける可能性あり。
  // 目的は「PDFダウンロード動線」の確認。
  const safe = text.replace(/[()\\]/g, (m) => `\\${m}`).slice(0, 80);
  const content = `BT /F1 18 Tf 50 760 Td (${safe}) Tj ET`;
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000256 00000 n 
0000000362 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const data = getInvoice(id);
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });

  const buf = buildTinyPdf(`Invoice ${data.invoice.invoice_number}`);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${data.invoice.invoice_number}.pdf"`,
    },
  });
}

