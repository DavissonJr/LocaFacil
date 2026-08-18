namespace LocacaoVeiculos.Api.Services;

public interface IMinioService
{
    Task<string> UploadArquivoAsync(Stream fileStream, string fileName, string contentType);
    Task RemoverArquivoAsync(string objectName);
    string ObterUrlPublica(string objectName);
}
