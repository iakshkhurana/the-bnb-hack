<script lang="ts">
	const paths: Record<string, string> = {
		home: 'M3 10.75 12 3.5l9 7.25M5.5 9.25V20.5h13V9.25',
		market: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		gauge: 'M12 15.5 16 9M4.5 19a9 9 0 1 1 15 0M8 19h8',
		proof: 'M9 12.5l2 2 4-4.5M12 2.5l7.5 3.5v5.5c0 4.6-3.2 7.9-7.5 9.5-4.3-1.6-7.5-4.9-7.5-9.5V6z',
		search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM16.2 16.2 21 21',
		bell: 'M6 9a6 6 0 0 1 12 0c0 6 2.5 6.5 2.5 8.5H3.5C3.5 15.5 6 15 6 9M10.4 20.5a1.8 1.8 0 0 0 3.2 0',
		wallet: 'M3.5 7.5A2.5 2.5 0 0 1 6 5h12.5v2.5M3.5 7.5V17A2.5 2.5 0 0 0 6 19.5h14.5v-10h-17zM16.5 14.5h.5',
		bolt: 'M13 2.5 4 14h6.5L11 21.5 20 10h-6.5z',
		shield: 'M12 2.5l7.5 3.5v5.5c0 4.6-3.2 7.9-7.5 9.5-4.3-1.6-7.5-4.9-7.5-9.5V6z',
		clock: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM12 7.5V12l3 2',
		x: 'M6 6l12 12M18 6 6 18',
		plus: 'M12 5v14M5 12h14',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		'chevron-down': 'M6 9.5l6 6 6-6',
		'chevron-right': 'M9.5 6l6 6-6 6',
		'arrow-up-right': 'M7 17 17 7M8 7h9v9',
		'arrow-down-right': 'M7 7l10 10M17 8v9H8',
		external: 'M14 4h6v6M20 4l-9 9M19 13.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5h5.5',
		copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
		grid: 'M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16',
		range: 'M4 12h4M16 12h4M10 6v12M14 6v12M10 9h4M10 15h4',
		leaf: 'M6 18C6 9 12 5 20 4c-1 8-5 14-14 14zM6 18c0-4 2-7 5-9M6 18 4 20',
		heart: 'M12 20.5C7 16.5 3.5 13 3.5 9A4.5 4.5 0 0 1 12 6.5 4.5 4.5 0 0 1 20.5 9c0 4-3.5 7.5-8.5 11.5z',
		revoke: 'M12 3.5a8.5 8.5 0 1 1-8.5 8.5M3.5 12 12 12M8 8l4 4-4 4M4 4l16 16',
		key: 'M14.5 9.5a5 5 0 1 0-4.7 5L11 13.3l1.5-.1.2-1.6 1.6-.2.1-1.5 1.6-.1zM15 9h.5M10.5 14 4 20.5M6.5 18l2 2',
		users: 'M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M15.5 4.6a3.5 3.5 0 0 1 0 6.3M17 14.8c2.3.6 4 2.4 4.5 5.2',
		spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z',
		doc: 'M6 3.5h8L19 8.5v12H6zM14 3.5v5h5M9.5 13h6M9.5 16.5h6',
		hive: 'M12 2.5 20 7v10l-8 4.5L4 17V7zM12 7.5 16 10v5l-4 2.5L8 15v-5z',
		gas: 'M5 20.5V5A1.5 1.5 0 0 1 6.5 3.5h6A1.5 1.5 0 0 1 14 5v15.5M3.5 20.5H15.5M14 9h2.5A1.5 1.5 0 0 1 18 10.5v6a1.5 1.5 0 0 0 3 0V9l-2.5-2.5M7.5 7h4',
		pause: 'M8 5.5v13M16 5.5v13',
		play: 'M7 4.5v15l13-7.5z'
	};

	let {
		name,
		size = 18,
		strokeWidth = 1.8,
		class: cls = ''
	}: { name: string; size?: number; strokeWidth?: number; class?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={cls}
	aria-hidden="true"
>
	<path d={paths[name] ?? ''} />
</svg>
