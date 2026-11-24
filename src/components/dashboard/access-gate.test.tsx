import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AccessGate } from "./access-gate";

describe("AccessGate", () => {
  it("explains that a new account is waiting for administrator approval", () => {
    const markup = renderToStaticMarkup(
      <AccessGate
        name="Cliente"
        accessStatus="pending"
        paymentStatus="pending"
        onManageAccount={vi.fn()}
      />,
    );

    expect(markup).toContain("aguardando a aprovação do administrador");
    expect(markup).toContain("Minha conta");
  });

  it("shows payment status after access approval", () => {
    const markup = renderToStaticMarkup(
      <AccessGate
        name="Cliente"
        accessStatus="approved"
        paymentStatus="pending"
        onManageAccount={vi.fn()}
      />,
    );

    expect(markup).toContain("aguardando a confirmação do pagamento");
    expect(markup).toContain("Aprovação: Liberada");
    expect(markup).toContain("Pagamento: Pendente");
  });

  it("explains when access is rejected", () => {
    const markup = renderToStaticMarkup(
      <AccessGate
        name="Cliente"
        accessStatus="rejected"
        paymentStatus="pending"
        onManageAccount={vi.fn()}
      />,
    );

    expect(markup).toContain("Acesso não liberado");
    expect(markup).toContain("Sua solicitação não foi aprovada");
  });
});
