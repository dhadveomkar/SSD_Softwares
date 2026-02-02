using System.Collections.Generic;
using System.Threading.Tasks;

namespace POCEmployeePortal.Service
{
    public class EmailService
    {
        private readonly GraphEmailService _GraphEmailService;

        public EmailService(GraphEmailService GraphEmailService)
        {
            _GraphEmailService = GraphEmailService;
        }

        // Existing methods (backward compatibility)
        public async Task SendSimpleEmailAsync(string to, string subject, string text)
        {
            await _GraphEmailService.SendEmailAsync(new List<string> { to }, null, subject, text);
        }

        public async Task SendHtmlEmailAsync(string to, string subject, string htmlContent)
        {
            await _GraphEmailService.SendEmailAsync(new List<string> { to }, null, subject, htmlContent);
        }

        public async Task SendEmailWithAttachmentAsync(string to, string subject, string text, string attachmentPath)
        {
            await _GraphEmailService.SendEmailAsync(new List<string> { to }, null, subject, text);
        }

        // ✅ New method: multiple recipients + CC
        public async Task SendEmailAsync(IEnumerable<string> to, IEnumerable<string> cc, string subject, string htmlContent)
        {
            await _GraphEmailService.SendEmailAsync(to, cc, subject, htmlContent);
        }
    }
}
