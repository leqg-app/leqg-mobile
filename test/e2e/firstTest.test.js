describe('Exemple de test E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {
        location: 'always',
      },
      delete: true,
    });
  });

  it("devrait lancer l'application et afficher la carte", async () => {
    await waitFor(element(by.id('map-screen')))
      .toBeVisible()
      .withTimeout(20000);
  });

  it('devrait afficher la barre de navigation', async () => {
    await expect(element(by.text('Rechercher un bar'))).toBeVisible();
  });

  it('devrait rester stable sans crash', async () => {
    await expect(element(by.id('map-screen'))).toBeVisible();
  });
});
