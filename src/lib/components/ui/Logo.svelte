<script lang="ts">
	/** HIVE mark: simple geometric diamond cluster, single flat color. */
	let { size = 26, class: cls = '' }: { size?: number; class?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" class={cls} aria-hidden="true">
	<path d="M16 3 20 7 16 11 12 7Z" />
	<path d="M7 12 11 16 7 20 3 16Z" />
	<path d="M25 12 29 16 25 20 21 16Z" />
	<path d="M16 21 20 25 16 29 12 25Z" />
	<path d="M16 11.6 20.4 16 16 20.4 11.6 16Z" />
</svg>
