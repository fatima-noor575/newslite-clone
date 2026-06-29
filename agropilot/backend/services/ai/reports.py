"""PDF report generator (daily/weekly/monthly)."""
import io
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def build(title: str, sections: list[tuple[str, list[list[str]]]]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    flow = [Paragraph(f"<b>{title}</b>", styles["Title"]),
            Paragraph(f"Generated: {date.today()}", styles["Normal"]),
            Spacer(1, 12)]
    for heading, rows in sections:
        flow += [Paragraph(f"<b>{heading}</b>", styles["Heading2"])]
        if rows:
            t = Table(rows, hAlign="LEFT")
            t.setStyle(TableStyle([
                ("BACKGROUND",(0,0),(-1,0),colors.lightgrey),
                ("GRID",(0,0),(-1,-1),0.25,colors.grey),
                ("FONTSIZE",(0,0),(-1,-1),9),
            ]))
            flow += [t, Spacer(1, 10)]
    doc.build(flow)
    return buf.getvalue()
