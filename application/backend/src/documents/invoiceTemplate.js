module.exports = ({ 
  invoiceDate,
  billingStartDate, 
  billingEndDate,
  rentAmount, 
  utilitiesAmount, 
  totalAmount, 
  paymentDeadline, 
  serviceContactName, 
  serviceContactPhone, 
  serviceContactEmail,
  creatorName,
  recipientName,
  recipientAddress,
  cooperativeName,
  cooperativeAddress
}) => {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Faktura za czynsz i media</title>
  </head>
  <body style="font-family: Arial, sans-serif; font-size: 12pt; color: #333; margin: 0; padding: 0;">
    <div style="width: 80%; margin: 0 auto; padding: 20px;">
      <!-- Nagłówek faktury -->
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 10px 0;">Faktura za czynsz i media</h1>
        <div>Data wystawienia: ${invoiceDate}</div>
      </div>
      <!-- Sekcja odbiorcy i twórcy dokumentu -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <!-- Kolumna twórcy dokumentu -->
        <div style="text-align: left; font-family: Arial, sans-serif; font-size: 12pt;">
          <h4>Kto stworzył dokument?</h4>
          <p style="font-weight: 100;">${creatorName}</p>
        </div>
        <!-- Kolumna odbiorcy -->
        <div style="text-align: right; font-family: Arial, sans-serif; font-size: 12pt;">
          <h4>Odbiorca:</h4>
          <p style="font-weight: 100;">${recipientName}, <br> ${recipientAddress}</p>
        </div>
      </div>
      <!-- Okres rozliczeniowy -->
      <div style="margin-bottom: 20px;">
          <h2 style="margin: 0;">Okres rozliczeniowy: ${billingStartDate}-${billingEndDate}</h2>
      </div>
      <!-- Tabela pozycji -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Nazwa pozycji</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Kwota</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Czynsz</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${rentAmount} zł</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Opłaty za media</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${utilitiesAmount} zł</td>
          </tr>
        </tbody>
      </table>
      <!-- Podsumowanie -->
      <div style="text-align: right; font-size: 14pt; font-weight: bold; margin-bottom: 20px;">
        Łączna kwota do zapłaty: ${totalAmount} zł
      </div>
      <!-- Informacje o płatności -->
      <div style="margin-top: 20px; font-size: 12pt;">
        <p style="margin: 5px 0;"><strong>Termin płatności:</strong> ${paymentDeadline}</p>
        <p style="margin: 5px 0;">W razie pytań lub niejasności prosimy o kontakt z działem obsługi mieszkańców:</p>
        <p style="margin: 5px 0;">
          <strong>${serviceContactName}</strong><br>
          Telefon: ${serviceContactPhone}<br>
          Email: ${serviceContactEmail}
        </p>
      </div>
      <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; font-size: 10pt; text-align: center;">
        <p style="margin: 5px;">${cooperativeName} – ${cooperativeAddress}</p>
      </div>
    </div>
  </body>
</html>
  `;
};
