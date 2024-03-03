import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	Card,
	ActionIcon,
	Code,
} from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash } from 'tabler-icons-react';

import {
	MantineProvider,
	ColorSchemeProvider,
	ColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';

export default function App() {
	const [tasks, setTasks] = useState([]);
	const [opened, setOpened] = useState(false);

	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	const taskTitle = useRef('');
	const taskSummary = useRef('');
	const taskStatus = useRef('');

	function createTask() {
		
		fetch('http://localhost:8000/create-todo', {
		method: 'POST', 
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			todo_name: taskTitle.current.value,
			todo_des: taskSummary.current.value,
			todo_status: taskStatus.current.value
		}),
		})
		.then(response => response.json())
		.then(response => {
			if(response.ok) {
			  // Reload the page to reflect the changes
			  window.location.reload();
			} else {
			  // Handle the error if the response is not ok
			  console.error('Failed to create a new task');
			}
		  })
		  .catch(error => console.error('Error:', error));
		window.location.reload();
	}

	function deleteTask(todo_id) {
		fetch(`http://localhost:8000/delete/todo/${todo_id}`, {
		method: 'DELETE', 
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			id: todo_id,
		}),
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// Remove the task from the tasks state
			setTasks(currentTasks => currentTasks.filter(task => task[0] !== todo_id));
		})
		.catch(error => console.error('Error:', error));
	}

	

	function get_data()
	{
		fetch('http://localhost:8000/get-all-todos')
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error('Error fetching tasks:', error));
	}

	useEffect(() => {
		fetch('http://localhost:8000/get-all-todos')
		.then(response => response.json())
		.then(data => setTasks(data))
		.catch(error => console.error('Error fetching tasks:', error));
		get_data();
	  }, []);
	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}>
			<MantineProvider
				theme={{ colorScheme, defaultRadius: 'md' }}
				withGlobalStyles
				withNormalizeCSS>
				<div className='App'>
					<Modal
						opened={opened}
						size={'md'}
						title={'New Task'}
						withCloseButton={false}
						onClose={() => {
							setOpened(false);
						}}
						centered>
						<TextInput
							mt={'md'}
							ref={taskTitle}
							placeholder={'Task Title'}
							required
							label={'Title'}
						/>
						<TextInput
							ref={taskSummary}
							mt={'md'}
							placeholder={'Task Summary'}
							label={'Summary'}
						/>
						<TextInput
							ref={taskStatus}
							mt={'md'}
							placeholder={'Task Status'}
							label={'Status'}
						/>
						<Group mt={'md'} position={'apart'}>
							<Button
								onClick={() => {
									setOpened(false);
								}}
								variant={'subtle'}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									createTask();
									setOpened(false);
								}}>
								Create Task
							</Button>
						</Group>
					</Modal>
					<Container size={550} my={40}>
						<Group position={'apart'}>
							<Title
								sx={theme => ({
									fontFamily: `Greycliff CF, ${theme.fontFamily}`,
									fontWeight: 900,
								})}>
								My Tasks
							</Title>
							<ActionIcon
								color={'blue'}
								onClick={() => toggleColorScheme()}
								size='lg'>
								{colorScheme === 'dark' ? (
									<Sun size={16} />
								) : (
									<MoonStars size={16} />
								)}
							</ActionIcon>
						</Group>
						{tasks.length > 0 ? (
							tasks.map((task, index) => {
								if (task[1]) {
									return (
										<Card withBorder key={index} mt={'sm'}>
											<Group position={'apart'}>
												<Text weight={'bold'}>{task[1]}</Text>
												<ActionIcon
													onClick={() => {
														deleteTask(task[0]);
													}}
													color={'red'}
													variant={'transparent'}>
													<Trash />
												</ActionIcon>
											</Group>
											<Text color={'dimmed'} size={'md'} mt={'sm'}>
												{task[2]
													? task[2]
													: 'No summary was provided for this task'}
											</Text>
										</Card>
									);
								}
							})
						) : (
							<Text size={'lg'} mt={'md'} color={'dimmed'}>
								You have no tasks
							</Text>
						)}
						<Button
							onClick={() => {
								setOpened(true);
							}}
							fullWidth
							mt={'md'}>
							New Task
						</Button>
					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
