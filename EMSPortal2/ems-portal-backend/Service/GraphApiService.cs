using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace POCEmployeePortal.Service
{
    public class GraphEmailService
    {
        private readonly IConfiguration _config;
        private readonly GraphServiceClient _graphClient;
        private readonly string _fromEmail;

        public GraphEmailService(IConfiguration config)
        {
            _config = config;
            _fromEmail = _config["Email:From"];

            var clientId = _config["AzureOAuth2:ClientId"];
            var clientSecret = _config["AzureOAuth2:ClientSecret"];
            var tenantId = _config["AzureOAuth2:TenantId"];

            var confidentialClient = ConfidentialClientApplicationBuilder
                .Create(clientId)
                .WithClientSecret(clientSecret)
                .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
                .Build();

            var authProvider = new DelegateAuthenticationProvider(async (requestMessage) =>
            {
                var result = await confidentialClient
                    .AcquireTokenForClient(new[] { "https://graph.microsoft.com/.default" })
                    .ExecuteAsync();

                requestMessage.Headers.Authorization =
                    new AuthenticationHeaderValue("Bearer", result.AccessToken);
            });

            _graphClient = new GraphServiceClient(authProvider);
        }

        // ✅ New method: supports multiple To + CC
        public async Task SendEmailAsync(IEnumerable<string> to, IEnumerable<string> cc, string subject, string body)
        {
            var message = new Message
            {
                Subject = subject,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = body
                },
                ToRecipients = to?.Select(addr => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = addr }
                }).ToList() ?? new List<Recipient>(),

                CcRecipients = cc?.Select(addr => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = addr }
                }).ToList() ?? new List<Recipient>(),

                From = new Recipient
                {
                    EmailAddress = new EmailAddress { Address = _fromEmail }
                }
            };

            await _graphClient.Users[_fromEmail]
                .SendMail(message, true)
                .Request()
                .PostAsync();
        }
    }
}
