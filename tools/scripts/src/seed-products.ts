import { listStoredProducts } from "@workspace/db";

async function main() {
  const products = await listStoredProducts();
  console.log(`Local catalogue ready with ${products.length} products.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
