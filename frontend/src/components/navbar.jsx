import {
  Avatar,
  Button,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { useEffect, useState } from "react";
import apiClient, { removeToken } from "../api";

export default function MyNavbar({ page }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      return;
    }
    try {
      apiClient.get("/api/v1/users/me").then((response) => {
        setUser(response.data);
      });
    } catch (error) {
      console.error("Failed to fetch user data: ", error);
    }
  }, []);

  const logout = () => {
    removeToken();
    setUser(undefined);
  };

  const userPart = (user) => {
    if (user) {
      return (
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">{user.full_name}</span>
              <span className="block truncate text-sm font-medium">
                {user.email}
              </span>
            </DropdownHeader>
            <DropdownItem onClick={logout}>登出</DropdownItem>
          </Dropdown>
          <NavbarToggle />
        </div>
      );
    } else {
      return (
        <div className="flex md:order-2">
          <Button color="blue" href="/login">
            {" "}
            登录{" "}
          </Button>
          <NavbarToggle />
        </div>
      );
    }
  };

  return (
    <>
      <Navbar fluid rounded>
        <NavbarBrand>
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            肺部结节检测系统
          </span>
        </NavbarBrand>
        {userPart(user)}
        <NavbarCollapse>
          <NavbarLink href="#" active={page === "home"}>
            首页
          </NavbarLink>
          <NavbarLink href="/detection" active={page === "detection"}>
            检测
          </NavbarLink>
          <NavbarLink href="/detection/history" active={page == "history"}>检测历史</NavbarLink>
          {/* <NavbarLink href="#">Pricing</NavbarLink>
          <NavbarLink href="#">Contact</NavbarLink> */}
        </NavbarCollapse>
      </Navbar>
    </>
  );
}
