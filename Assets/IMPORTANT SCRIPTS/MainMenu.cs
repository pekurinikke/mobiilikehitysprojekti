using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{
    public void PlayGame()
    {
        SceneManager.LoadSceneAsync(1);
    }
    public void LevelSelection()
    {
        SceneManager.LoadSceneAsync(2);
    }
    public void Customisation()
    {
        SceneManager.LoadSceneAsync(3);
    }
    public void Options()
    {
        SceneManager.LoadSceneAsync(4);
    }
    public void Return()
    {
        SceneManager.LoadSceneAsync(0);
    }
    public void QuitGame()
    {
        Application.Quit();
    }
}
