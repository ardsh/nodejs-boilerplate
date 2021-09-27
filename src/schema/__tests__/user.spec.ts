import { testSchema } from "./testSchema";

it("Returns current user", async () => {
    const user = { id: 'test', name: 'Test' };
    const schema = testSchema(user);
    const result = await schema.processQuery('{ me { id, name } }');
    expect(result.data.me).toEqual(user);
});
