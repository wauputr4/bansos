<script lang="ts">
	let { value = $bindable(''), required = false, id = '' } = $props();

	let open = $state(false);

	function parseDateLocal(dateStr: string) {
		if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date();
		const [year, month, day] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, day);
	}

	let currentDate = $state(value ? parseDateLocal(value) : new Date());
	let currentMonth = $derived(currentDate.getMonth());
	let currentYear = $derived(currentDate.getFullYear());

	$effect(() => {
		if (value) {
			currentDate = parseDateLocal(value);
		}
	});

	let selectedDateObj = $derived(value ? parseDateLocal(value) : null);

	const monthNames = [
		'Januari',
		'Februari',
		'Maret',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Agustus',
		'September',
		'Oktober',
		'November',
		'Desember'
	];
	const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year: number, month: number) {
		return new Date(year, month, 1).getDay();
	}

	let calendarDays = $derived.by(() => {
		const daysInMonth = getDaysInMonth(currentYear, currentMonth);
		const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
		const days = [];

		for (let i = 0; i < firstDay; i++) {
			days.push(null);
		}

		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}

		return days;
	});

	function prevMonth() {
		currentDate = new Date(currentYear, currentMonth - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentYear, currentMonth + 1, 1);
	}

	function selectDate(day: number) {
		if (!day) return;
		const d = new Date(currentYear, currentMonth, day);
		// Format to YYYY-MM-DD
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		value = `${yyyy}-${mm}-${dd}`;
		open = false;
	}

	function toggleCalendar() {
		open = !open;
		if (open && value) {
			currentDate = new Date(value);
		}
	}

	function formatDateDisplay(val: string) {
		if (!val) return 'Pilih Tanggal';
		const d = parseDateLocal(val);
		if (isNaN(d.getTime())) return val;
		return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
	}
</script>

<div class="custom-date-picker">
	<button type="button" class="select-btn" onclick={toggleCalendar} {id}>
		<span class={!value ? 'placeholder' : ''}>{formatDateDisplay(value)}</span>
		<i class="fa-regular fa-calendar"></i>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="dropdown-backdrop" onclick={() => (open = false)}></div>
		<div class="calendar-dropdown glass-card">
			<div class="calendar-header">
				<button type="button" onclick={prevMonth} class="nav-btn" aria-label="Bulan sebelumnya"
					><i class="fa-solid fa-chevron-left"></i></button
				>
				<span class="month-year">{monthNames[currentMonth]} {currentYear}</span>
				<button type="button" onclick={nextMonth} class="nav-btn" aria-label="Bulan berikutnya"
					><i class="fa-solid fa-chevron-right"></i></button
				>
			</div>

			<div class="calendar-grid">
				{#each dayNames as day (day)}
					<div class="day-name">{day}</div>
				{/each}

				{#each calendarDays as day, i (i)}
					{#if day === null}
						<div class="empty-day"></div>
					{:else}
						{@const isSelected =
							selectedDateObj !== null &&
							selectedDateObj.getFullYear() === currentYear &&
							selectedDateObj.getMonth() === currentMonth &&
							selectedDateObj.getDate() === day}
						<button
							type="button"
							class="day-btn"
							class:selected={isSelected}
							onclick={() => selectDate(day)}
						>
							{day}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Hidden input for native form validation if needed -->
	<input type="date" bind:value {required} style="display: none;" />
</div>

<style>
	.custom-date-picker {
		position: relative;
		width: 100%;
	}

	.select-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.65rem 0.85rem;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.95rem;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.select-btn:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.placeholder {
		color: var(--text-muted);
	}

	.dropdown-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10;
		cursor: default;
	}

	.calendar-dropdown {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		width: 18rem;
		background: color-mix(in srgb, var(--bg-primary) 95%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 1rem;
		z-index: 20;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(16px);
	}

	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.month-year {
		font-weight: 700;
		font-size: 1rem;
		color: var(--text-primary);
	}

	.nav-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.35rem;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.nav-btn:hover {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		color: var(--text-primary);
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.25rem;
	}

	.day-name {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.day-btn {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 0.35rem;
		color: var(--text-primary);
		font-size: 0.85rem;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.day-btn:hover {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
	}

	.day-btn.selected {
		background: var(--color-accent);
		color: #fff;
		font-weight: 700;
	}

	.empty-day {
		aspect-ratio: 1;
	}
</style>
