import chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest("http://192.168.1.182:8080/");

describe("API TEST", () => {
  let cookieName;
  let cookieValue;

  describe("ENDPOINT Sessions", () => {
    const mockUser = {
      firstName: "Coder",
      lastName: "Testing",
      age: 100,
      email: "testering@gmail.com",
      password: "1234",
    };

    it("LOGIN", async () => {
      const result = await requester.post("api/sessions/login").send({
        email: "tester@gmail.com",
        password: "123",
      });

      const cookie = result.headers["set-cookie"][0];
      expect(cookie).to.be.ok;

      cookieName = cookie.split("=")[0];
      cookieValue = cookie.split("=")[1];

      expect(cookieName).to.be.ok.and.eql("connect.sid");
      expect(cookieValue).to.be.ok;
    });

    it("REGISTER", async () => {
      const response = await requester.post("api/sessions/register").send(mockUser);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { status } = response;

      expect(status).to.equal(302);
    });

    it("CURRENT USER", async () => {
      const { _body } = await requester
        .get("api/sessions/current")
        .set("Cookie", [`${cookieName}=${cookieValue}`])
        .set("x-test-request", "true");

      expect(_body.user.email).to.be.eql(mockUser.email);
    });
  });
  describe("ENDPOINT Products", () => {
    it("GET", async () => {
      const response = await requester.get("api/products");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(200);
      expect(_body.payload).to.be.an.instanceof(Array);
    });
    it("POST", async () => {
      const productMock = {
        title: "Producto de prueba",
        description: "Esta es una descripción de prueba",
        category: "Inolvidable",
        price: 5000,
        thumbnail: "https://example.com/imagen.jpg",
        code: 1234,
        stock: 100,
      };
      const response = await requester
        .post("api/products")
        .send(productMock)
        .set("Cookie", [`${cookieName}=${cookieValue}`])
        .set("x-test-request", "true");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(201);
      expect(_body.payload).to.have.property("_id");
    });
    it("PUT", async () => {
      const productIdToUpdate = "647b6a0c2a2deaefe1fc283c";
      const updatedProductData = {
        title: "ORIGINAL ARG",
        description: "Doble medallón de carne vacuna, doble cheddar,pan de papa",
        category: "Original Class",
        price: 2500,
        thumbnail: "./images/img3.jpg",
        code: 1003,
        stock: 97,
      };
      const response = await requester
        .put(`api/products/${productIdToUpdate}`)
        .send(updatedProductData)
        .set("x-test-request", "true");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(201);
      expect(_body.payload).to.have.eql(`Has actualizado el producto con ID ${productIdToUpdate}`);
    });
    it("DELETE", async () => {
      const productIdToDelete = "65272be3d96fa427ea3566de";
      const response = await requester
        .delete(`api/products/${productIdToDelete}`)
        .set("Cookie", [`${cookieName}=${cookieValue}`])
        .set("x-test-request", "true");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(200);
      expect(_body.payload).to.have.eql(`Has eliminado el producto con ID ${productIdToDelete}`);
    });
  });

  describe("ENDPOINT Carts", () => {
    it("GET", async () => {
      const response = await requester.get("api/carts");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(200);
      expect(_body.payload).to.be.an.instanceof(Array);
    });
    it("POST", async () => {
      const cartId = "ToIthONHr1Xm07DlvaADPma9b";
      const prodId = "647b6a402a2deaefe1fc2848";
      const response = await requester.post(`api/carts/${cartId}/products/${prodId}`).set("x-test-request", "true");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(200);
      expect(_body.payload.cart).to.have.property("_id");
    });
    it("PUT", async () => {
      const cartId = "ToIthONHr1Xm07DlvaADPma9b";
      const updatedCartData = {
        products: [
          {
            product: "647b6a152a2deaefe1fc283e",
            quantity: 2,
          },
          {
            product: "647b6a362a2deaefe1fc2846",
            quantity: 8,
          },
        ],
      };
      const response = await requester.put(`api/carts/${cartId}`).send(updatedCartData).set("x-test-request", "true");
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(200);
      expect(_body.message).to.have.eql("Cart updated successfully");
      expect(_body.cart).to.have.property("_id");
    });
    it("DELETE", async () => {
      const cartIdToDelete = "ToIthONHr1Xm07DlvaADPma9b";
      const response = await requester.delete(`api/carts/${cartIdToDelete}`);
      if (response.error) {
        throw new Error(response.error.message);
      }
      const { status, _body } = response;
      expect(status).to.equal(200);
      expect(_body.message).to.have.eql("Cart cleared successfully");
    });
  });
});