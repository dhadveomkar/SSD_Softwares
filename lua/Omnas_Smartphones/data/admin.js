document.getElementById("addProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = {
    brand: document.getElementById("brand").value,
    model: document.getElementById("model").value,
    ram: document.getElementById("ram").value,
    rom: document.getElementById("rom").value,
    price: document.getElementById("price").value
  };

  const res = await fetch("http://localhost:8080/add-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });

  const data = await res.json();

  if (data.added) {
    alert("📱 Smartphone Added Successfully!");
    document.getElementById("addProductForm").reset();
  }
});
