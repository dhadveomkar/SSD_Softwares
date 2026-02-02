namespace POCEmployeePortal.ApiResponse
{
    public class ApiResponse
    {
        public int MessageId { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public ApiResponse(int statusCode, bool success, string message, object data = null)
        {
            MessageId = statusCode;
            Success = success;
            Message = message;
            Data = data;

        }
    }
}
