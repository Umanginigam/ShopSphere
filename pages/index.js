import Layout from "@/components/Layout";
import ProductItem from "@/components/ProductItem";
import Product from "@/models/Product";
import db from "@/utils/db";
import { Store } from "@/utils/Store";
import axios from "axios";
import Link from "next/link";
import { useContext } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { toast } from "react-toastify";

export default function Home({ featuredProducts, products }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((item) => item.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    dispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity: quantity },
    });

    toast.success("Product added to the cart");
  };

  return (
    <>
      <div className="relative z-0 mb-12">
        <Carousel 
          showThumbs={false} 
          autoPlay 
          infiniteLoop
          showStatus={false}
          showArrows={true}
          className="rounded-xl overflow-hidden shadow-2xl"
        >
          {featuredProducts.map((product) => (
            <div key={product._id} className="relative">
              <Link href={`/product/${product.slug}`} passHref>
                <div className="relative h-[400px] md:h-[500px] lg:h-[600px] cursor-pointer group">
                  <img 
                    src={product.banner} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{product.name}</h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Latest Products
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 pb-12">
        {products.map((product) => (
          <ProductItem
            product={product}
            key={product.slug}
            addToCartHandler={addToCartHandler}
          />
        ))}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  // await db.connect();
  const products = await Product.find().lean();
  const featuredProducts = products.filter(
    (product) => product.isFeatured === true
  );
  return {
    props: {
      featuredProducts: featuredProducts.map(db.convertDocToObj),
      products: products.map(db.convertDocToObj),
    },
  };
}
