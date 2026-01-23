---
title: TanStack Query setup for offline caching
description: "Code snippet to easily setup offline caching for TanStack Query in a React Native app"
publishDate: "2025-01-28T18:07:00Z"
---

Code snippet to easily setup offline caching for TanStack Query in a React Native app.

```tsx
import { persister } from "@/lib/mmkv";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect, type PropsWithChildren } from "react";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import NetInfo from "@react-native-community/netinfo";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Number.POSITIVE_INFINITY,
			gcTime: Number.POSITIVE_INFINITY,
		},
	},
});

export function QueryProvider({ children }: PropsWithChildren) {
	useReactQueryDevTools(queryClient);

	useEffect(() => {
		return NetInfo.addEventListener((state) => {
			const status = !!state.isConnected;
			onlineManager.setOnline(status);
		});
	}, []);

	return (
		<PersistQueryClientProvider
			client={queryClient}
			onSuccess={() =>
				queryClient
					.resumePausedMutations()
					.then(() => queryClient.invalidateQueries())
			}
			persistOptions={{ persister, maxAge: Number.POSITIVE_INFINITY }}
		>
			{children}
		</PersistQueryClientProvider>
	);
}
```
