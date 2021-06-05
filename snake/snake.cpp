// snake.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"

using namespace std;

HANDLE console = GetStdHandle(STD_OUTPUT_HANDLE);
COORD pos;
COORD topLeft = { 0, 0 };
CONSOLE_SCREEN_BUFFER_INFO CSBInfo;

struct win
{
	string nick;
	int score;
};
vector<win> winners(11);

WORD oldColorAttr;
// char *gameOver = "---- GAME OVER ----";
// char *newGame = "New game";
// char *menu = "High score";
// char *exit2 = "Exit";
int eaten = 0;
int wall = 0;
int tail = 0;
int noOfEaten = 0;
int dir = 0;
int response = 0;
int cookieX = rand() % 79;
int cookieY = rand() % 22;
int threadStop = 0;
int NoOfLine = 0;
int OK = 0;
int HSQuit = 0;
int speed = 300;
int rysujMenu_c = 0;
string winnersNick;

vector<short int> splash_h1;
vector<short int> splash_h2;
int splash_sizeX = 80;
int splash_sizeY = 23;

vector<string> highScoreStr;
vector<int> highScoreInt;
vector<vector<int>> highScoreCoord(2);

vector<int> x = { 15,16,16,17,18,18,18,18,17,17,17,18 };
vector<int> y = { 15,15,16,16,16,15,14,13,13,12,11,11 };
//vector<vector<int>> coord(2, vector<int>(15));
vector<vector<int>> coord(2);
vector<vector<int>> arenaXup(2, vector<int>(80));
vector<vector<int>> arenaXdown(2, vector<int>(80));
vector<vector<int>> arenaY(2, vector<int>(40));
vector<char> score(4);
vector<int> cookie(2);
vector<int> cookieBuff(2);

vector< vector<char> > prevScreen(80, vector<char>(23));
vector< vector<char> > screen(80, vector<char>(23));

void GOmenu();
void splash();
void rysuj(vector< vector<char> > screen, vector< vector<char> > &prevScreen);

bool sortBy2ndColumn(win i, win j);
void checkHighScore(int &NoOfLine);
void ShowConsoleCursor(bool showFlag);
void startNewGame(int newOne);
void clrscr();

void changeColor(int colorCode)
{
	WORD oldColorAttr;

	SetConsoleTextAttribute(console, colorCode);
}

void fillScreenHS()
{
	// wypełnianie całej areny spacjami
	for (short int i = 1; i < 79; i++)
	{
		for (short int a = 1; a < 21; a++)
		{
			pos = { i, a };
			SetConsoleCursorPosition(console, pos);
			cout << " ";
		}
	}

	// tworzenie obramowania areny
	for (int i = 0; i < arenaXup[0].size(); i++)
	{
		screen[arenaXup[0][i]][arenaXup[1][i]] = '_';
	}
	for (int i = 0; i < arenaXdown[0].size(); i++)
	{
		screen[arenaXdown[0][i]][arenaXdown[1][i]] = '^';
	}
	for (int i = 0; i < arenaY[0].size(); i++)
	{
		screen[arenaY[0][i]][arenaY[1][i]] = '|';
	}

	// tworzenie ciasteczka
	screen[cookie[0]][cookie[1]] = '#';

	// tworzenie 'score'
	for (int i = 0; i < score.size(); i++)
	{
		screen[70 + i][22] = score[i];
	}

	string napis = "score:";
	// char *napis = "score:";

	// tworzenie napisu 'score'
	for (int i = 0; i < strlen(napis.c_str()); i++)
	{
		screen[63 + i][22] = napis[i];
	}
}

void printHS()
{
	NoOfLine = 0;
	checkHighScore(NoOfLine);
	fillScreenHS();
	pos = { 4, 3 };
	SetConsoleCursorPosition(console, pos);
	cout << "HIGH SCORE";
	for (short int i = 0; i < NoOfLine; i++)
	{
		pos = { 4, 5 + i };
		SetConsoleCursorPosition(console, pos);
		cout << winners[i].nick << "\t" << winners[i].score;
	}
	short int q = 5 + NoOfLine + 2;
	pos = { 4, q };
	SetConsoleCursorPosition(console, pos);
	cout << "Press (n) to start new game or (q) to quit.";
	while (1)
	{
		if (HSQuit == 2)
		{
			coord[0].erase(coord[0].begin(), coord[0].end());
			coord[1].erase(coord[1].begin(), coord[1].end());
			threadStop = 1;
			HSQuit = 0;
			Sleep(20);
			OK = 0;
			splash();
			startNewGame(1);
		}
		else if (HSQuit == 1)
		{
			threadStop = 1;
			clrscr();
			exit(1);
		}
		Sleep(20);
	}
}

void defaultColor()
{
	SetConsoleTextAttribute(console, oldColorAttr);
}

void createCord()
{
	for (int i = 0; i < x.size(); i++)
	{
		coord[0].push_back(x[i]);
		coord[1].push_back(y[i]);
	}


	// koordynaty x dla areny
	for (int i = 0; i < 80; i++)
	{
		arenaXup[0][i] = i;
	}
	for (int i = 0; i < 20; i++)
	{
		arenaY[0][i] = 79;
	}
	for (int i = 0; i < 80; i++)
	{
		arenaXdown[0][i] = i;
	}
	for (int i = 20; i < 40; i++)
	{
		arenaY[0][i] = 0;
	}

	// koordynaty y dla areny
	for (int i = 0; i < 80; i++)
	{
		arenaXup[1][i] = 0;
	}
	for (int i = 0; i < 20; i++)
	{
		arenaY[1][i] = i + 1;
	}
	for (int i = 0; i < 80; i++)
	{
		arenaXdown[1][i] = 21;
	}
	for (int i = 20; i < 40; i++)
	{
		arenaY[1][i] = i - 19;
	}
}

void mySleep()
{
	chrono::seconds(10);
}

void clrscr()
{
	DWORD written;
	cout.flush();
	GetConsoleScreenBufferInfo(console, &CSBInfo);
	FillConsoleOutputCharacterA(
		console, ' ', CSBInfo.dwSize.X * CSBInfo.dwSize.Y, topLeft, &written
	);
	/*	FillConsoleOutputAttribute(
			console, FOREGROUND_GREEN | FOREGROUND_RED | FOREGROUND_BLUE,
			screen.dwSize.X * screen.dwSize.Y, topLeft, &written
		);*/
	SetConsoleCursorPosition(console, topLeft);
}

void change(int dir, vector<int> &xx)
{
	int size = xx.size();
	if (dir == 0)
	{
		for (int i = size; i >= 1; i--)
		{
			xx[i - 1]++;
		}
	}
}

void sound(int result)
{
	int win[5] = { 261, 329, 349, 329, 349 };
	int winL[5] = { 100, 100, 100, 100, 500 };
	if (result == 1)
	{
		for (int i = 0; i < 5; i++)
		{
			Beep(win[i], winL[i]);
			Sleep(100);
		}
	}
}

void move(int dir, vector<vector<int>> &cord, int &wall, int &tail, int &eaten, int &noOfEaten)
{
	int size = cord[0].size();
	int check = 0;
	int check_ = 0;
	int stop = 0;
	if (cookie[0] == coord[0][coord[0].size() - 1] && cookie[1] == coord[1][coord[0].size() - 1])
	{
		eaten = 2;
		noOfEaten++;
		Beep(523, 200);
		speed = int(speed / 1.1);
		if (dir == 0)
		{
			coord[0].push_back(coord[0][coord[0].size() - 1] + 1);
			coord[1].push_back(coord[1][coord[1].size() - 1]);
		}
		else if (dir == 1)
		{
			coord[0].push_back(coord[0][coord[0].size() - 1]);
			coord[1].push_back(coord[1][coord[1].size() - 1] - 1);
		}
		else if (dir == 2)
		{
			coord[0].push_back(coord[0][coord[0].size() - 1] - 1);
			coord[1].push_back(coord[1][coord[1].size() - 1]);
		}
		else if (dir == 3)
		{
			coord[0].push_back(coord[0][coord[0].size() - 1]);
			coord[1].push_back(coord[1][coord[1].size() - 1] + 1);
		}
	}
	else
	{
		// ruch w prawo
		if (dir == 0)
		{
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[0][i - 1];
				if (check == 0)
				{
					if (cord[0][i - 1] < 78)
					{
						int check2 = 0;
						for (int a = 0; a < size - 1; a++)
						{
							if (cord[0][i - 1] == cord[0][a] - 1 && cord[1][i - 1] == cord[1][a])
							{
								check2 = 1;
							}
						}
						if (check2 == 1)
						{
							tail = 1;
							break;
						}
						else
						{
							cord[0][i - 1]++;
						}
					}
					else
					{
						wall = 1;
						break;
					}
				}
				else if (check != 0 && check != cord[0][i - 1])
				{
					if (check < cord[0][i - 1])
					{
						cord[0][i - 1]--;
					}
					else if (check > cord[0][i - 1])
					{
						cord[0][i - 1]++;
					}
				}
				check = cord[0][i - 1];
			}
			check = 0;
			check_ = 0;

			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[1][i - 1];
				if (check == 0)
				{
					check = cord[1][i - 1];
				}
				else if (check != 0 && check != cord[1][i - 1])
				{
					if (check < cord[1][i - 1])
					{
						cord[1][i - 1]--;
					}
					else if (check > cord[1][i - 1])
					{
						cord[1][i - 1]++;
					}
				}
			}

			/*		for (int i = 0; i < size; i++)
					{
						if (cord[0][i] == cord[0][size - 1] && cord[1][i] == cord[1][size - 1])
						{

						}
					} */
		}

		// ruch w górę
		else if (dir == 1)
		{
			check = 0;
			check_ = 0;
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[1][i - 1];
				if (check == 0)
				{
					//
					if (cord[1][i - 1] > 1)
					{
						int check2 = 0;
						for (int a = 0; a < size - 1; a++)
						{
							if (cord[0][i - 1] == cord[0][a] && cord[1][i - 1] == cord[1][a] + 1)
							{
								check2 = 1;
							}
						}
						if (check2 == 1)
						{
							tail = 1;
							break;
						}
						else
						{
							cord[1][i - 1]--;
						}
					}
					else
					{
						wall = 1;
						break;
					}
					//

		/*			if (cord[1][i - 1] > 1)
					{
						cord[1][i - 1]--;
					}
					else
					{
						wall = 1;
					} */
				}
				else if (check != 0 && check != cord[1][i - 1])
				{
					if (check < cord[1][i - 1])
					{
						cord[1][i - 1]--;
					}
					else if (check > cord[1][i - 1])
					{
						cord[1][i - 1]++;
					}
				}
				check = cord[1][i - 1];
			}
			check = 0;
			check_ = 0;
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[0][i - 1];
				if (check == 0)
				{
					check = cord[0][i - 1];
				}
				else if (check != 0 && check != cord[0][i - 1])
				{
					if (check < cord[0][i - 1])
					{
						cord[0][i - 1]--;
					}
					else if (check > cord[0][i - 1])
					{
						cord[0][i - 1]++;
					}
				}
			}
		}
		// ruch w lewo
		else if (dir == 2)
		{
			check = 0;
			check_ = 0;
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[0][i - 1];
				if (check == 0)
				{
					//
					if (cord[0][i - 1] > 1)
					{
						int check2 = 0;
						for (int a = 0; a < size - 1; a++)
						{
							if (cord[0][i - 1] == cord[0][a] + 1 && cord[1][i - 1] == cord[1][a])
							{
								check2 = 1;
							}
						}
						if (check2 == 1)
						{
							tail = 1;
							break;
						}
						else
						{
							cord[0][i - 1]--;
						}
					}
					else
					{
						wall = 1;
						break;
					}
					//
	/*				if (cord[0][i - 1] > 1)
					{
						cord[0][i - 1]--;
					}
					else
					{
						wall = 1;
					} */
				}
				else if (check != 0 && check != cord[0][i - 1])
				{
					if (check < cord[0][i - 1])
					{
						cord[0][i - 1]--;
					}
					else if (check > cord[0][i - 1])
					{
						cord[0][i - 1]++;
					}
				}
				check = cord[0][i - 1];
			}
			check = 0;
			check_ = 0;
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[1][i - 1];
				if (check == 0)
				{
					check = cord[1][i - 1];
				}
				else if (check != 0 && check != cord[1][i - 1])
				{
					if (check < cord[1][i - 1])
					{
						cord[1][i - 1]--;
					}
					else if (check > cord[1][i - 1])
					{
						cord[1][i - 1]++;
					}
				}
			}
		}
		// ruch w dół
		else if (dir == 3)
		{
			check = 0;
			check_ = 0;
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[1][i - 1];
				if (check == 0)
				{
					//
					if (cord[1][i - 1] < 20)
					{
						int check2 = 0;
						for (int a = 0; a < size - 1; a++)
						{
							if (cord[0][i - 1] == cord[0][a] && cord[1][i - 1] == cord[1][a] - 1)
							{
								check2 = 1;
							}
						}
						if (check2 == 1)
						{
							tail = 1;
							break;
						}
						else
						{
							cord[1][i - 1]++;
						}
					}
					else
					{
						wall = 1;
						break;
					}
					//
	/*				if (cord[1][i - 1] < 22)
					{
						cord[1][i - 1]++;
					}
					else
					{
						wall = 1;
					} */
				}
				else if (check != 0 && check != cord[1][i - 1])
				{
					if (check < cord[1][i - 1])
					{
						cord[1][i - 1]--;
					}
					else if (check > cord[1][i - 1])
					{
						cord[1][i - 1]++;
					}
				}
				check = cord[1][i - 1];
			}
			check = 0;
			check_ = 0;
			for (int i = size; i >= 1; i--)
			{
				if (check != check_)
				{
					check = check_;
				}
				check_ = cord[0][i - 1];
				if (check == 0)
				{
					check = cord[0][i - 1];
				}
				else if (check != 0 && check != cord[0][i - 1])
				{
					if (check < cord[0][i - 1])
					{
						cord[0][i - 1]--;
					}
					else if (check > cord[0][i - 1])
					{
						cord[0][i - 1]++;
					}
				}
			}
		}
	}
	cookieBuff[0] = cord[0][cord[0].size() - 1];
	cookieBuff[1] = cord[1][cord[1].size() - 1];
	//	for (int i = 0; i < coord[0].size(); i++)
	//	{
	/*		if (cookie[0] == coord[0][coord[0].size() - 1] && cookie[1] == coord[1][coord[0].size() - 1])
			{
				eaten = 2;
				noOfEaten++;
				if (dir == 0)
				{
					coord[0].push_back(coord[0][coord[0].size() - 1] + 1);
					coord[1].push_back(coord[1][coord[1].size() - 1]);
				}
				else if (dir == 1)
				{
					coord[0].push_back(coord[0][coord[0].size() - 1]);
					coord[1].push_back(coord[1][coord[1].size() - 1] - 1);
				}
				else if (dir == 2)
				{
					coord[0].push_back(coord[0][coord[0].size() - 1] - 1);
					coord[1].push_back(coord[1][coord[1].size() - 1]);
				}
				else if (dir == 3)
				{
					coord[0].push_back(coord[0][coord[0].size() - 1]);
					coord[1].push_back(coord[1][coord[1].size() - 1] + 1);
				}
			} */
			//	}
}

int menuLvl = 0;
void rysujMenu(int &dir)
{
	if (dir == 3)
	{
		if (menuLvl < 2)
		{
			menuLvl++;
		}
	}
	else if (dir == 1)
	{
		if (menuLvl > 0)
		{
			menuLvl--;
		}
	}
	dir = 4; // wartość 4 blokuje ciągłe odświerzanie menu


	if (rysujMenu_c == 0)
	{
		for (short int x = 17; x < 52; x++)
		{
			for (short int y = 5; y < 15; y++)
			{
				pos = { x, y };
				SetConsoleCursorPosition(console, pos);
				cout << " ";
			}
		}
		rysujMenu_c = 1;
	}

	// wstawianie napisu 'Game Over'
	pos = { 27, 8 };
	SetConsoleCursorPosition(console, pos);
	cout << "---- Game Over ----";
	cout.flush();

	// wstawianie napisu 'New game'

	pos = { 27, 9 };
	SetConsoleCursorPosition(console, pos);
	if (menuLvl == 0)
	{
		changeColor(10);
		cout << "New game";
		defaultColor();
		cout.flush();
	}
	else
	{
		cout << "New game";
		cout.flush();
	}


	// wstawianie napisu 'High score'

	pos = { 27, 10 };
	SetConsoleCursorPosition(console, pos);
	if (menuLvl == 1)
	{
		changeColor(10);
		cout << "High score";
		defaultColor();
		cout.flush();
	}
	else
	{
		cout << "High score";
		cout.flush();
	}

	// wstawianie napisu 'Exit'

	pos = { 27, 11 };
	SetConsoleCursorPosition(console, pos);
	if (menuLvl == 2)
	{
		changeColor(10);
		cout << "Exit";
		defaultColor();
		cout.flush();
	}
	else
	{
		cout << "Exit";
		cout.flush();
	}

	SetConsoleCursorPosition(console, topLeft);
	//	cout.flush();
}

void rysuj(vector< vector<char> > screen, vector< vector<char> > &prevScreen)
{
	for (short int i = 0; i < 23; i++)
	{
		for (short int a = 0; a < 80; a++)
		{
			if (screen[a][i] == prevScreen[a][i])
			{
				if (a == cookieBuff[0] && i == cookieBuff[1])
				{
					pos = { a, i };
					SetConsoleCursorPosition(console, pos);
					defaultColor();
					cout << screen[a][i];
				}
				continue;
			}
			pos = { a, i };
			SetConsoleCursorPosition(console, pos);
			if (a == cookie[0] && i == cookie[1])
			{
				changeColor(10);
				cout << screen[a][i];
				defaultColor();
			}
			else
			{
				cout << screen[a][i];
			}

			if (noOfEaten > winners[0].score)
			{
				for (short int i = 0; i < score.size(); i++)
				{
					pos = { 70 + i, 22 };
					SetConsoleCursorPosition(console, pos);
					changeColor(10);
					cout << screen[70 + i][22];
					defaultColor();
				}
			}
		}
	}
	prevScreen = screen;
	SetConsoleCursorPosition(console, topLeft);
	cout.flush();
}

void readKey(int &dir, int &OK, int &HSQuit)
{
	while (threadStop == 0)
	{
		if (GetAsyncKeyState(37) == -32767)
		{
			if (dir != 0)
			{
				dir = 2;
			}
		}
		else if (GetAsyncKeyState(38) == -32767)
		{
			if (dir != 3)
			{
				dir = 1;
			}
		}
		else if (GetAsyncKeyState(39) == -32767)
		{
			if (dir != 2)
			{
				dir = 0;
			}
		}
		else if (GetAsyncKeyState(40) == -32767)
		{
			if (dir != 1)
			{
				dir = 3;
			}
		}
		else if (GetAsyncKeyState(32) == -32767)
		{
			OK = 1;
		}
		else if (GetAsyncKeyState(81) == -32767)
		{
			HSQuit = 1;
		}
		else if (GetAsyncKeyState(78) == -32767)
		{
			HSQuit = 2;
		}
		Sleep(10);
	}
}

void test(int result)
{
	if (result == 1)
	{
		cout << "Best score!";
		ShowConsoleCursor(true);
		cin >> winnersNick;
		ShowConsoleCursor(false);
	}
}

void putHSFormOnScreen(int result)
{
	if (result > 0)
	{
		if (result == 1)
		{
			// wstawianie napisu 'High Score'
			pos = { 20,8 };
			SetConsoleCursorPosition(console, pos);
			cout << "Best score!";
			pos = { 20,9 };
			SetConsoleCursorPosition(console, pos);
			ShowConsoleCursor(true);
			cout << "Your name: ";
			cin >> winnersNick;
			ShowConsoleCursor(false);
			OK = 0;
			Sleep(100);
		}
		else if (result == 2)
		{
			// wstawianie napisu 'High Score'
			pos = { 20,8 };
			SetConsoleCursorPosition(console, pos);
			cout << "Your score is one of the best 10 scores!";
			pos = { 20,9 };
			SetConsoleCursorPosition(console, pos);
			ShowConsoleCursor(true);
			cout << "Your name: ";
			cin >> winnersNick;
			ShowConsoleCursor(false);
			Sleep(100);
			OK = 0;
			Sleep(100);
		}
		if (NoOfLine < 10)
		{
			winners[NoOfLine].nick = winnersNick;
			winners[NoOfLine].score = noOfEaten;

		}
		else if (NoOfLine == 10)
		{

			winners[NoOfLine - 1].nick = winnersNick;
			winners[NoOfLine - 1].score = noOfEaten;
		}

		// zapis do pliku
		string line;
		ofstream file("score.txt");
		if (!file)
		{
			cout << "Cannot open the file.\n";
			exit(1);
		}
		file << winners[0].nick << "\t" << winners[0].score;
		if (NoOfLine < 10)
		{
			for (int i = 1; i < NoOfLine + 1; i++)
			{
				file << "\n" << winners[i].nick << "\t" << winners[i].score;
			}
		}
		else if (NoOfLine == 10)
		{
			for (int i = 1; i < NoOfLine; i++)
			{
				file << "\n" << winners[i].nick << "\t" << winners[i].score;
			}
		}

		file.close();
	}
}



void fillScreen(char *text)
{
	// wypełnianie całej areny spacjami
	for (int i = 0; i < 80; i++)
	{
		for (int a = 0; a < 23; a++)
		{
			screen[i][a] = ' ';
		}
	}

	// umieszanie na ekranie węża
	for (int i = 0; i < coord[0].size(); i++)
	{
		screen[coord[0][i]][coord[1][i]] = '#';
	}

	// tworzenie obramowania areny
	for (int i = 0; i < arenaXup[0].size(); i++)
	{
		screen[arenaXup[0][i]][arenaXup[1][i]] = '_';
	}
	for (int i = 0; i < arenaXdown[0].size(); i++)
	{
		screen[arenaXdown[0][i]][arenaXdown[1][i]] = '^';
	}
	for (int i = 0; i < arenaY[0].size(); i++)
	{
		screen[arenaY[0][i]][arenaY[1][i]] = '|';
	}

	// tworzenie ciasteczka
	screen[cookie[0]][cookie[1]] = '#';

	// tworzenie 'score'
	for (int i = 0; i < score.size(); i++)
	{
		screen[70 + i][22] = score[i];
	}

	string napis = "score:";
	// char *napis = "score:";

	// tworzenie napisu 'score'
	for (int i = 0; i < strlen(napis.c_str()); i++)
	{
		screen[63 + i][22] = napis[i];
	}

	// tworzenie napisu
	for (int i = 0; i < strlen(text); i++)
	{
		screen[3 + i][22] = text[i];
	}
}

void ShowConsoleCursor(bool showFlag)
{
	CONSOLE_CURSOR_INFO     cursorInfo;
	GetConsoleCursorInfo(console, &cursorInfo);
	cursorInfo.bVisible = showFlag; // set the cursor visibility
	SetConsoleCursorInfo(console, &cursorInfo);
}

void cookieMaker(int &eaten, int cookieX, int cookieY)
{
	int check1 = 0;
	int check2 = 0;
	if (eaten == 2)
	{
		while (check1 == 0)
		{
			check2 = 0;
			cookieX = (rand() % 78) + 1;
			cookieY = (rand() % 20) + 1;
			for (int i = 0; i < coord[0].size(); i++)
			{
				if (cookieX == coord[0][i] && cookieY == coord[1][i])
				{
					check2 = 1;
					break;
				}
			}
			if (check2 == 0)
			{
				check1 = 1;
			}
		}
		eaten = 1;
		cookie[0] = cookieX;
		cookie[1] = cookieY;
	}
}

void scoreCounter(int noOfEaten, int &eaten)
{
	string scoreS = to_string(noOfEaten);
	char *scoreArr = (char*)scoreS.c_str();
	if (eaten == 1)
	{
		int c = 0;
		for (int i = strlen(scoreArr); i >= 1; i--)
		{
			score[score.size() - 1 - c] = scoreArr[i - 1];
			c++;
		}
		eaten = 0;
	}
}

void startNewGame(int newOne)
{
	wall = 0;
	tail = 0;
	threadStop = 0;
	noOfEaten = 0;
	dir = 0;
	speed = 300;
	rysujMenu_c = 0;
	createCord();
	cookie[0] = cookieX;
	cookie[1] = cookieY;
	// zerowanie buforu ostatniego ekranu
	for (int i = 0; i < 80; i++)
	{
		for (int a = 0; a < 23; a++)
		{
			prevScreen[i][a] = ' ';
		}
	}


	// wypełnianie wektora 'score' zerami
	for (int i = 0; i < score.size(); i++)
	{
		score[i] = '0';
	}
	if (newOne == 0)
	{
		clrscr();
	}

	thread readkey(readKey, ref(dir), ref(OK), ref(HSQuit));

	while (1)
	{
		move(dir, coord, wall, tail, eaten, noOfEaten);
		cookieMaker(eaten, cookieX, cookieY);
		scoreCounter(noOfEaten, eaten);
		if (wall == 1 || tail == 1)
		{
			GOmenu();
		}
		if (noOfEaten > winners[0].score)
		{
			fillScreen(const_cast<char*>("Best score!"));
		}
		else
		{
			fillScreen(const_cast<char*>(" "));
		}
		rysuj(screen, prevScreen);

		/*		if (wall == 1 || tail == 1)
		{
		readKey.detach();
		ShowConsoleCursor(true);
		exit(1);
		} */
		Sleep(speed);
	}
}

void GOmenu()
{
	/*	for (int i = 0; i < 3; i++)
		{
			cout << "Name: ";
			cin >> winnersNick;
			cout << "\n";
			cout << "2ndName: ";
			cin >> winnersNick;
			cout << "\n";
		}
	*/

	if (wall == 1)
	{
		sound(1);
		char *text = const_cast<char*>("Snake hit the wall.");
		for (short int i = 0; i < strlen(text); i++)
		{
			short int x = 3 + i;
			pos = { x, 22 };
			SetConsoleCursorPosition(console, pos);
			cout << text[i];
		}
	}
	if (tail == 1)
	{
		sound(1);
		char *text = const_cast<char*>("Snake ate his tail.");
		for (short int i = 0; i < strlen(text); i++)
		{
			short int x = 3 + i;
			pos = { x, 22 };
			SetConsoleCursorPosition(console, pos);
			cout << text[i];
		}
	}

	if (noOfEaten > winners[0].score)
	{
		// zerowanie obszaru
		for (short int x = 26; x < 52; x++)
		{
			for (short int y = 7; y < 13; y++)
			{
				pos = { x, y };
				SetConsoleCursorPosition(console, pos);
				cout << " ";
			}
		}
		putHSFormOnScreen(1);
	}
	else if (noOfEaten > winners[NoOfLine].score || NoOfLine < 10)
	{
		// zerowanie obszaru
		for (short int x = 26; x < 52; x++)
		{
			for (short int y = 7; y < 13; y++)
			{
				pos = { x, y };
				SetConsoleCursorPosition(console, pos);
				cout << " ";
			}
		}
		//		test(1);
		putHSFormOnScreen(2);
		//		exit(1);
	}
	// zerowanie obszaru dla menu
	for (short int x = 26; x < 52; x++)
	{
		for (short int y = 7; y < 13; y++)
		{
			pos = { x, y };
			SetConsoleCursorPosition(console, pos);
			cout << " ";
		}
	}


	int check = 0;
	while (1)
	{
		if (dir != 4) // wartość 4 blokuje odświerzanie menu (niweluje to miganie)
		{
			rysujMenu(dir);
		}
		if (menuLvl == 0)
		{
			if (OK == 1)
			{
				coord[0].erase(coord[0].begin(), coord[0].end());
				coord[1].erase(coord[1].begin(), coord[1].end());
				threadStop = 1;
				Sleep(20);
				OK = 0;
				splash();
				startNewGame(1);
			}
		}
		else if (menuLvl == 1)
		{
			if (OK == 1)
			{
				printHS();
				menuLvl = 4;
			}
		}
		else if (menuLvl == 2)
		{
			if (OK == 1)
			{
				threadStop = 1;
				exit(1);
			}
		}

		//		cout.flush();
		Sleep(10);
	}
	exit(1);

}

void splash_fillVect()
{
	for (int y = 0; y < splash_sizeY; y++)
	{
		for (int x = 0; x < splash_sizeX; x++)
		{
			splash_h1.push_back(x);
		}
	}


	for (int y = 0; y < splash_sizeY; y++)
	{
		for (int x = 0; x < splash_sizeX; x++)
		{
			splash_h2.push_back(y);
		}
	}
}

void splash_fill(char input)
{
	while (splash_h1.size() > 0)
	{
		int x = rand() % (splash_h1.size());
		pos = { splash_h1[x] , splash_h2[x] };
		SetConsoleCursorPosition(console, pos);
		cout << input;
		splash_h1.erase(splash_h1.begin() + x);
		splash_h2.erase(splash_h2.begin() + x);
		SetConsoleCursorPosition(console, topLeft);
		//		Sleep(1);
	}
}

void splash_fill_out()
{
	while (splash_h1.size() > 0)
	{
		int x = rand() % (splash_h1.size());
		pos = { splash_h1[x] , splash_h2[x] };
		SetConsoleCursorPosition(console, pos);
		cout << screen[splash_h1[x]][splash_h2[x]];
		splash_h1.erase(splash_h1.begin() + x);
		splash_h2.erase(splash_h2.begin() + x);
		SetConsoleCursorPosition(console, topLeft);
		//		Sleep(1);
	}
}

void splash()
{
	splash_fillVect();
	splash_fill('#');
	splash_fillVect();
	cookie[0] = cookieX;
	cookie[1] = cookieY;
	fillScreen(const_cast<char*>(" "));

	splash_fill_out();
}

bool sortBy2ndColumn(win i, win j)
{
	return i.score > j.score;
}

void checkHighScore(int &NoOfLine)
{
	// otwarcie pliku z high score
	string line;
	if (ifstream("score.txt"))
	{
		ifstream file("score.txt");
		if (!file)
		{
			cout << "Cannot open the file.\n";
			exit(1);
		}
		size_t pos = 0;
		string delimiter = "\t";
		string token;
		if (file.peek() != ifstream::traits_type::eof())
		{
			while (!file.eof())
			{
				getline(file, line);
				pos = line.find(delimiter);
				token = line.substr(0, pos);
				line.erase(0, pos + delimiter.length());
				winners[NoOfLine].nick = token;
				winners[NoOfLine].score = stoi(line);
				NoOfLine++;
			}
			file.close();
			sort(winners.begin(), winners.end(), sortBy2ndColumn);
		}
	}
	else
	{
		ofstream file("score.txt");
		if (!file)
		{
			cout << "Cannot create the file.\n";
			exit(1);
		}
	}
}

int main()
{
	srand(time(NULL));
	ShowConsoleCursor(false);

	checkHighScore(NoOfLine);




	//	exit(1);

		// zapis informacji o kolorze terminala
	CONSOLE_SCREEN_BUFFER_INFO CSBInfo;
	GetConsoleScreenBufferInfo(console, &CSBInfo);
	oldColorAttr = CSBInfo.wAttributes;

	startNewGame(0);

	return 0;
}

