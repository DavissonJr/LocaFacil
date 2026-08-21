using LocacaoVeiculos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LocacaoVeiculos.Api.Data;

public class AppDbContext : DbContext
{
    private readonly ITenantProvider _tenantProvider;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public DbSet<Empresa> Empresas => Set<Empresa>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Veiculo> Veiculos => Set<Veiculo>();
    public DbSet<VeiculoFoto> VeiculoFotos => Set<VeiculoFoto>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Contrato> Contratos => Set<Contrato>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Empresa>(e =>
        {
            e.HasIndex(x => x.CNPJ).IsUnique();
        });

        modelBuilder.Entity<Usuario>(e =>
        {
            e.HasIndex(x => new { x.EmpresaId, x.Email }).IsUnique();
            e.HasOne(x => x.Empresa).WithMany(x => x.Usuarios).HasForeignKey(x => x.EmpresaId);
        });

        modelBuilder.Entity<Veiculo>(e =>
        {
            e.HasIndex(x => new { x.EmpresaId, x.Placa }).IsUnique();
            e.HasOne(x => x.Empresa).WithMany(x => x.Veiculos).HasForeignKey(x => x.EmpresaId);
            e.Property(x => x.ValorDiaria).HasColumnType("decimal(10,2)");
            // Global query filter: toda consulta de veículos já vem filtrada pela empresa do usuário logado
            e.HasQueryFilter(x => _tenantProvider.EmpresaId == null || x.EmpresaId == _tenantProvider.EmpresaId);
        });

        modelBuilder.Entity<VeiculoFoto>(e =>
        {
            e.HasOne(x => x.Veiculo).WithMany(x => x.Fotos).HasForeignKey(x => x.VeiculoId).OnDelete(DeleteBehavior.Cascade);
            e.HasQueryFilter(x => _tenantProvider.EmpresaId == null || x.EmpresaId == _tenantProvider.EmpresaId);
        });

        modelBuilder.Entity<Cliente>(e =>
        {
            e.HasIndex(x => new { x.EmpresaId, x.Documento }).IsUnique();
            e.HasOne(x => x.Empresa).WithMany(x => x.Clientes).HasForeignKey(x => x.EmpresaId);
            e.HasQueryFilter(x => _tenantProvider.EmpresaId == null || x.EmpresaId == _tenantProvider.EmpresaId);
        });

        modelBuilder.Entity<Contrato>(e =>
        {
            e.HasOne(x => x.Empresa).WithMany(x => x.Contratos).HasForeignKey(x => x.EmpresaId);
            e.HasOne(x => x.Veiculo).WithMany().HasForeignKey(x => x.VeiculoId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Cliente).WithMany().HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
            e.Property(x => x.ValorDiaria).HasColumnType("decimal(10,2)");
            e.Property(x => x.ValorTotal).HasColumnType("decimal(10,2)");
            e.HasQueryFilter(x => _tenantProvider.EmpresaId == null || x.EmpresaId == _tenantProvider.EmpresaId);
        });
    }
}
