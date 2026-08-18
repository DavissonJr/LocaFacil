using Minio;
using Minio.DataModel.Args;

namespace LocacaoVeiculos.Api.Services;

public class MinioService : IMinioService
{
    private readonly IMinioClient _client;
    private readonly string _bucket;
    private readonly string _endpoint;
    private readonly string _publicEndpoint;
    private readonly bool _useSsl;

    public MinioService(IConfiguration config)
    {
        var section = config.GetSection("Minio");
        _endpoint = section["Endpoint"]!;
        // Endpoint que o NAVEGADOR do usuário consegue acessar (ex: localhost:9000).
        // O _endpoint (ex: minio:9000) só funciona dentro da rede interna do Docker.
        _publicEndpoint = section["PublicEndpoint"] ?? _endpoint;
        _bucket = section["BucketName"]!;
        _useSsl = bool.Parse(section["UseSSL"] ?? "false");

        _client = new MinioClient()
            .WithEndpoint(_endpoint)
            .WithCredentials(section["AccessKey"], section["SecretKey"])
            .WithSSL(_useSsl)
            .Build();
    }

    private async Task GarantirBucketAsync()
    {
        bool existe = await _client.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucket));
        if (!existe)
        {
            await _client.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucket));

            // Torna o bucket público para leitura (fotos de veículos não são sensíveis)
            var policy = $$"""
            {
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": ["arn:aws:s3:::{{_bucket}}/*"]
                }]
            }
            """;
            await _client.SetPolicyAsync(new SetPolicyArgs().WithBucket(_bucket).WithPolicy(policy));
        }
    }

    public async Task<string> UploadArquivoAsync(Stream fileStream, string fileName, string contentType)
    {
        await GarantirBucketAsync();

        var objectName = $"{Guid.NewGuid()}-{fileName}";

        await _client.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucket)
            .WithObject(objectName)
            .WithStreamData(fileStream)
            .WithObjectSize(fileStream.Length)
            .WithContentType(contentType));

        return objectName;
    }

    public async Task RemoverArquivoAsync(string objectName)
    {
        await _client.RemoveObjectAsync(new RemoveObjectArgs().WithBucket(_bucket).WithObject(objectName));
    }

    public string ObterUrlPublica(string objectName)
    {
        var proto = _useSsl ? "https" : "http";
        return $"{proto}://{_publicEndpoint}/{_bucket}/{objectName}";
    }
}
