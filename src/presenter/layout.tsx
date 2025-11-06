import { Layout } from "@/components/presenter/Layout";
import { Outlet } from "react-router";

const RootLayout = () => {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

export default RootLayout;