import { resolve } from "path"

export default {
	base: "/vr-toybox/",
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				one: resolve(__dirname, "1d.html"),
				two: resolve(__dirname, "2d.html"),
				twoPointFive: resolve(__dirname, "2_5d.html"),
			},
		},
	},
};
