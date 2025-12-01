import { Enrollment, Course, User } from "@shared/schema";

export interface CertificateData {
  studentName: string;
  courseName: string;
  hours: number;
  completionDate: Date;
  instructorName?: string;
  schoolName: string;
  schoolApprovalNumber: string;
  deliveryMethod: string;
}

export function generateCertificateHTML(data: CertificateData): string {
  const completionDateStr = data.completionDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Completion Certificate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .certificate {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 11 / 8.5;
      background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
      border: 3px solid #1a472a;
      border-radius: 15px;
      padding: 60px 80px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(90deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
      margin-top: 10px;
    }
    .school-name {
      font-size: 28px;
      font-weight: bold;
      color: #1a472a;
      margin-bottom: 5px;
    }
    .school-number {
      font-size: 12px;
      color: #666;
      margin-bottom: 20px;
    }
    .title {
      font-size: 42px;
      font-weight: bold;
      color: #1a472a;
      margin-bottom: 30px;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 50px;
      font-style: italic;
    }
    .content {
      text-align: center;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }
    .award-text {
      font-size: 14px;
      color: #333;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .student-name {
      font-size: 32px;
      font-weight: bold;
      color: #1a472a;
      text-decoration: underline;
      margin: 20px 0;
      text-transform: capitalize;
    }
    .course-details {
      font-size: 14px;
      color: #333;
      margin: 30px 0;
      line-height: 1.8;
    }
    .detail-item {
      margin: 10px 0;
    }
    .detail-label {
      font-weight: bold;
      display: inline-block;
      width: 150px;
      text-align: right;
      margin-right: 20px;
    }
    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 50px;
      position: relative;
      z-index: 1;
    }
    .signature-block {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-top: 2px solid #333;
      margin: 40px 0 5px 0;
      height: 0;
    }
    .signature-title {
      font-size: 12px;
      color: #333;
      font-style: italic;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #999;
      margin-top: 30px;
      position: relative;
      z-index: 1;
    }
    .seal {
      position: absolute;
      bottom: 60px;
      right: 60px;
      width: 100px;
      height: 100px;
      border: 3px solid #1a472a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      color: #1a472a;
      text-align: center;
      background: rgba(26, 71, 42, 0.05);
      padding: 10px;
    }
    .seal-inner {
      font-size: 10px;
      line-height: 1.2;
    }
    @media print {
      body { background: white; padding: 0; }
      .certificate { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="school-name">FoundationCE</div>
      <div class="school-number">School Approval #: ${data.schoolApprovalNumber}</div>
      <div class="title">Certificate of Completion</div>
      <div class="subtitle">This certificate recognizes successful completion of a pre-licensing education course</div>
    </div>

    <div class="content">
      <div class="award-text">
        This is to certify that
      </div>
      <div class="student-name">${data.studentName}</div>
      <div class="award-text">
        has successfully completed all requirements of
      </div>

      <div class="course-details">
        <div class="detail-item">
          <span class="detail-label">Course:</span>
          ${data.courseName}
        </div>
        <div class="detail-item">
          <span class="detail-label">Hours Earned:</span>
          ${data.hours} hours
        </div>
        <div class="detail-item">
          <span class="detail-label">Completion Date:</span>
          ${completionDateStr}
        </div>
        <div class="detail-item">
          <span class="detail-label">Delivery Method:</span>
          ${data.deliveryMethod}
        </div>
        ${
          data.instructorName
            ? `<div class="detail-item">
          <span class="detail-label">Instructor:</span>
          ${data.instructorName}
        </div>`
            : ""
        }
      </div>

      <div class="award-text">
        This certificate is issued as proof of course completion and may be presented to regulatory authorities as evidence of completion of required pre-licensing education.
      </div>
    </div>

    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-title">School Administrator</div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-title">Date Issued</div>
      </div>
    </div>

    <div class="seal">
      <div class="seal-inner">
        FoundationCE<br>
        Official<br>
        Certificate
      </div>
    </div>

    <div class="footer">
      Certificate ID: ${Math.random().toString(36).substring(2, 15)}<br>
      This certificate has been generated electronically and is valid without a physical signature.
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCertificateFileName(
  studentName: string,
  completionDate: Date
): string {
  const sanitizedName = studentName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const dateStr = completionDate.toISOString().split("T")[0];
  return `certificate-${sanitizedName}-${dateStr}.html`;
}
