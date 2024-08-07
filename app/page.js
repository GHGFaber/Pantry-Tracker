"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import Image from "next/image";
import {
  Box,
  Typography,
  Modal,
  Stack,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Input,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";

import Grid from "@mui/material/Grid";

import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { PieChart } from "@mui/x-charts/PieChart";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemNum, setItemNum] = useState(0);
  const [itemQuantities, setItemQuantities] = useState({});

  const [searchedInv, setSearchedInv] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blob, setBlob] = useState("");

  const greenPalette = [
    "#e0f2e9", // Very light green
    "#a8d5ba", // Light green
    "#80bfa5", // Medium light green
    "#4f8b5c", // Medium green
    "#2c4d32", // Dark green
    "#004d00", // Very dark green
  ];
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);

    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    console.log("🚀 ~ updateInventory ~ inventoryList:", inventoryList);
  };

  const removeItem = async (item, num, array = []) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity - num < 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - num }, { merge: true });
      }
    }
    console.log("prefilter", array);
    const reduced = array
      .map((i) => {
        if (i.name === item) {
          i.quantity += -num;
        }
        return i;
      })
      .filter((i) => i.quantity > 0);

    console.log("change in filter", reduced);
    setSearchedInv(reduced);
    await updateInventory();
  };
  const addItem = async (item, num = 1, blob, array = []) => {
    console.log("dam", typeof num === "number");
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity !== null) {
        await setDoc(
          docRef,
          {
            quantity: quantity + num,
          },
          { merge: true }
        );
      }
    } else {
      console.log("🚀 ~ addItem ~ item:", item);
      console.log("🚀 ~ addItem ~ blob:", blob);
      await setDoc(docRef, { quantity: num, img: blob === null ? "" : blob });
    }
    setBlob("");
    console.log("prefilter", array);
    const reduced = array
      .map((i) => {
        if (i.name === item) {
          i.quantity += -num;
        }
        return i;
      })
      .filter((i) => i.quantity > 0);

    console.log("change in filter", reduced);
    setSearchedInv(reduced);
    await updateInventory();
  };

  const filterQuery = async (query) => {
    console.log(query);
    const pattern = `^${query}.*$`;
    const regex = new RegExp(pattern, "i");
    if (query === "") {
      setSearchedInv([]);
    } else {
      const match = inventory.filter((s) => regex.test(s.name));
      setSearchedInv(match);
    }
  };

  const filterBy = async (list, type) => {
    if (type === "alphabet") {
      const sortedList = [...list].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setSearchedInv(sortedList);
    }
    if (type === "ralphabet") {
      const sortedList = [...list].sort((a, b) =>
        b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      );
      setSearchedInv(sortedList);
    }
    if (type === "quantityMost") {
      const sortedList = [...list].sort((a, b) => b.quantity - a.quantity);
      setSearchedInv(sortedList);
    }
    if (type === "quantityLeast") {
      const sortedList = [...list].sort((a, b) => a.quantity - b.quantity);
      setSearchedInv(sortedList);
    }
  };

  const handleUpload = (e, adding = false, item = "") => {
    const file = e.target.files[0];
    console.log("🚀 ~ handleUpload ~ file:", file);
    if (file) {
      let reader = new FileReader();
      reader.onloadend = function () {
        const base64String = reader.result
          .replace("data:", "")
          .replace(/^.+,/, "");
        console.log(base64String);
        setBlob(base64String);
        if (adding === true) {
          addImage(item, base64String);
        }
      };
      reader.readAsDataURL(file); // This line starts the reading process
    }
  };

  const addImage = async (item, blobEncoding) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    console.log("ADDING");

    if (docSnap.exists()) {
      console.log("PLEASE", docSnap.data());
      const { quantity, img } = docSnap.data();

      await setDoc(
        docRef,
        { img: blob !== "" ? blob : blobEncoding },
        { merge: true }
      ); // Use setDoc with merge option

      setBlob("");
      await updateInventory();
    }
  };
  const handleInputChange = (name, value) => {
    setItemQuantities((prevQuantities) => ({
      ...prevQuantities,
      [name]: value === "" ? 1 : Number(value),
    }));
  };

  const handleBlur = (name, value) => {
    setItemQuantities((prevQuantities) => ({
      ...prevQuantities,
      [name]: Number(value),
    }));
  };

  useEffect(() => {
    updateInventory();
    filterQuery(searchQuery);
  }, [searchQuery]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        {" "}
        <AppBar sx={{ bgcolor: "green" }} position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Pantry Tracker
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Box
        height="100%"
        p={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={2}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            top="40%"
            left="calc(50vw - 300px)"
            width={500}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            position="absolute"
            p={4}
            gap={3}
          >
            {" "}
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                placeholder="Item Name"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "green", // Default border color
                    },
                    "&:hover fieldset": {
                      borderColor: "darkgreen", // Hover border color
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "green", // Focused border color
                      boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Custom focus ring
                    },
                  },
                }}
                fullWidth
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
              ></TextField>
              <Button
                sx={{
                  bgcolor: "green",
                  "&:hover": {
                    bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
                  },
                  "&:active": {
                    bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
                  },
                  "&:focus": {
                    bgcolor: "green", // Keep the same color for focus state
                    boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
                  },
                }}
                variant="contained"
                component="label"
              >
                Image
                <input type="file" hidden onChange={handleUpload} />
              </Button>
              <TextField
                variant="outlined"
                placeholder="#Quantity"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "green", // Default border color
                    },
                    "&:hover fieldset": {
                      borderColor: "darkgreen", // Hover border color
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "green", // Focused border color
                      boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Custom focus ring
                    },
                  },
                }}
                fullWidth
                value={itemNum}
                onChange={(e) => {
                  setItemNum(Number(e.target.value));
                }}
              ></TextField>

              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  color: "green",
                  borderColor: "green",
                  "&:hover": {
                    bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
                    borderColor: "green",
                    color: "white",
                  },
                  "&:active": {
                    bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
                    borderColor: "green",
                    color: "white",
                  },
                  "&:focus": {
                    bgcolor: "green", // Keep the same color for focus state
                    borderColor: "green",
                    color: "white",
                    boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
                  },
                }}
                onClick={() => {
                  addItem(itemName, itemNum, blob, []);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <PieChart
          slotProps={{ legend: { hidden: true } }}
          series={[
            {
              data: inventory.map((item, index) => ({
                id: index,
                value: item.quantity,
                label: item.name,
                color: greenPalette[index % greenPalette.length],
              })),
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 5,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
              cx: 150,
              highlightScope: { faded: "global", highlighted: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            },
          ]}
          width={400}
          height={200}
        />
        <Stack direction="row" spacing={2}>
          <Button
            sx={{
              bgcolor: "green",
              "&:hover": {
                bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
              },
              "&:active": {
                bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
              },
              "&:focus": {
                bgcolor: "green", // Keep the same color for focus state
                boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
              },
              fontFamily: "Gill Sans, sans-serif",
            }}
            variant="contained"
            onClick={() => {
              handleOpen();
            }}
          >
            Add New Item
          </Button>
          <TextField
            placeholder="Search inventory"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "green", // Default border color
                },
                "&:hover fieldset": {
                  borderColor: "darkgreen", // Hover border color
                },
                "&.Mui-focused fieldset": {
                  borderColor: "green", // Focused border color
                  boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Custom focus ring
                },
              },
            }}
            onChange={(e) => {
              console.log(e.target.value);
              setSearchQuery(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          ></TextField>
          <TextField
            label="Filter by"
            variant="filled"
            select
            sx={{
              width: 200,
              "& .MuiFilledInput-root": {
                "&:before": {
                  borderBottom: "1px solid green", // Default border color
                },
                "&:hover:not(.Mui-disabled):before": {
                  borderBottom: "2px solid darkgreen", // Hover border color
                },
                "&:after": {
                  borderBottom: "2px solid green", // Active border color
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "green", // Label color when focused
              },
            }}
            onChange={(e) => {
              console.log("filter", e.target.value);
              searchedInv.length === 0
                ? filterBy(inventory, e.target.value)
                : filterBy(searchedInv, e.target.value);
            }}
          >
            <MenuItem key="alphabet" value="alphabet">
              Alphabetical
            </MenuItem>
            <MenuItem key="ralphabet" value="ralphabet">
              Reverse
            </MenuItem>
            <MenuItem key="quantityMost" value="quantityMost">
              Quantity (Most)
            </MenuItem>
            <MenuItem key="quantityLeast" value="quantityLeast">
              Quantity (Least)
            </MenuItem>
          </TextField>
        </Stack>

        <Box border="1px solid #000">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            bgcolor="#62a87c"
          >
            <Typography
              variant="h2"
              display="flex"
              textAlign="center"
              alignContent="center"
              justifyContent="center"
              color="#FFF"
              sx={{ fontFamily: "monospace" }}
            >
              Inventory Items
            </Typography>
          </Box>
          <Box overflow="scroll" minWidth="1500px" maxHeight="50%">
            <Grid padding={1} container spacing={2}>
              {searchedInv.length === 0 && searchQuery === "" ? (
                inventory.map(({ name, quantity, img }) => (
                  <Grid key={name} item xs={12} sm={6} md={4}>
                    <Box
                      borderRadius="20px"
                      key={name}
                      width="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      bgcolor="#f0f0f0"
                      flexDirection="column"
                      padding={5}
                    >
                      {console.log(img)}
                      {img !== "" ? (
                        <Paper sx={{ width: "100px", height: "100px" }}>
                          <img
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                            src={`data:image/png;base64,` + `${img}`}
                          />
                        </Paper>
                      ) : (
                        <Button
                          sx={{
                            bgcolor: "green",
                            width: "100px",
                            height: "100px",
                            textAlign: "center",
                            bgcolor: "green",
                            "&:hover": {
                              bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
                            },
                            "&:active": {
                              bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
                            },
                            "&:focus": {
                              bgcolor: "green", // Keep the same color for focus state
                              boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
                            },
                          }}
                          variant="contained"
                          component="label"
                        >
                          Add Image
                          <input
                            type="file"
                            hidden
                            onChange={(e) => {
                              handleUpload(e, true, name);
                            }}
                          />
                        </Button>
                      )}
                      <Typography variant="h5" color="#333" textAlign="center">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="h5" color="#333" textAlign="right">
                        {quantity}
                      </Typography>

                      <Stack direction="row" spacing={2}>
                        <TextField
                          placeholder="Add/Remove Amt"
                          fullWidth
                          onChange={(e) =>
                            handleInputChange(name, e.target.value)
                          }
                          onBlur={(e) => handleBlur(name, e.target.value)}
                          sx={{
                            width: "100px",
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "green", // Default border color
                              },
                              "&:hover fieldset": {
                                borderColor: "darkgreen", // Hover border color
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "green", // Focused border color
                                boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Custom focus ring
                              },
                            },
                          }}
                        ></TextField>
                        <Button
                          sx={{
                            bgcolor: "green",
                            "&:hover": {
                              bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
                            },
                            "&:active": {
                              bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
                            },
                            "&:focus": {
                              bgcolor: "green", // Keep the same color for focus state
                              boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
                            },
                          }}
                          variant="contained"
                          onClick={() => {
                            addItem(name, itemQuantities[name] || 1, null);
                          }}
                        >
                          Add
                        </Button>
                        <Button
                          sx={{
                            bgcolor: "red",
                            "&:hover": {
                              bgcolor: "darkred", // A slightly darker shade for hover state
                            },
                            "&:active": {
                              bgcolor: "darkred", // Keep the same color or make it slightly different if needed
                            },
                            "&:focus": {
                              bgcolor: "red", // Keep the same color for focus state
                              boxShadow: "0 0 0 3px rgba(255, 0, 0, 0.5)", // Optional: add a custom focus ring
                            },
                          }}
                          variant="contained"
                          onClick={() => {
                            removeItem(name, itemQuantities[name] || 1);
                          }}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                ))
              ) : searchedInv.length === 0 && searchQuery !== "" ? (
                <Grid item xs={2} sm={6} md={4}>
                  <Box
                    key={name}
                    width="100%"
                    minHeight="150px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="#f0f0f0"
                    padding={5}
                  >
                    <Typography variant="h3" color="#333" textAlign="center">
                      No Items Found
                    </Typography>
                    <Stack direction="row" spacing={2}></Stack>
                  </Box>
                </Grid>
              ) : (
                searchedInv.map(({ name, quantity, img }) => (
                  <Grid key={name} item xs={12} sm={6} md={4}>
                    <Box
                      borderRadius="20px"
                      key={name}
                      width="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      bgcolor="#f0f0f0"
                      flexDirection="column"
                      padding={5}
                    >
                      {img !== "" ? (
                        <Paper sx={{ width: "100px", height: "100px" }}>
                          <img
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                            src={`data:image/png;base64,` + `${img}`}
                          />
                        </Paper>
                      ) : (
                        <Button
                          sx={{
                            width: "100px",
                            height: "100px",
                            textAlign: "center",
                            bgcolor: "green",
                            "&:hover": {
                              bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
                            },
                            "&:active": {
                              bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
                            },
                            "&:focus": {
                              bgcolor: "green", // Keep the same color for focus state
                              boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
                            },
                          }}
                          variant="contained"
                          component="label"
                        >
                          Add Image
                          <input
                            type="file"
                            hidden
                            onChange={(e) => {
                              handleUpload(e, true, name);
                            }}
                          />
                        </Button>
                      )}
                      <Typography variant="h5" color="#333" textAlign="center">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="h5" color="#333" textAlign="right">
                        {quantity}
                      </Typography>

                      <Stack direction="row" spacing={2}>
                        <TextField
                          placeholder="Add/Remove Amt"
                          onChange={(e) =>
                            handleInputChange(name, e.target.value)
                          }
                          onBlur={(e) => handleBlur(name, e.target.value)}
                        ></TextField>
                        <Button
                          sx={{
                            bgcolor: "green",
                            "&:hover": {
                              bgcolor: "darkgreen", // You can choose a slightly darker shade for hover
                            },
                            "&:active": {
                              bgcolor: "darkgreen", // Keep the same color or make it slightly different if needed
                            },
                            "&:focus": {
                              bgcolor: "green", // Keep the same color for focus state
                              boxShadow: "0 0 0 3px rgba(0, 255, 0, 0.5)", // Optional: add a custom focus ring
                            },
                          }}
                          variant="contained"
                          onClick={() => {
                            addItem(
                              name,
                              itemQuantities[name] || 1,
                              null,
                              searchedInv
                            );
                          }}
                        >
                          Add
                        </Button>
                        <Button
                          sx={{
                            bgcolor: "red",
                            "&:hover": {
                              bgcolor: "darkred", // A slightly darker shade for hover state
                            },
                            "&:active": {
                              bgcolor: "darkred", // Keep the same color or make it slightly different if needed
                            },
                            "&:focus": {
                              bgcolor: "red", // Keep the same color for focus state
                              boxShadow: "0 0 0 3px rgba(255, 0, 0, 0.5)", // Optional: add a custom focus ring
                            },
                          }}
                          variant="contained"
                          onClick={() => {
                            removeItem(
                              name,
                              itemQuantities[name] || 1,
                              searchedInv
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
}
